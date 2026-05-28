'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// NVIDIA TensorFlow Inference Pipeline
// Manages GPU node discovery, workload distribution, and inference orchestration
// across a clustered set of TensorFlow-serving containers backed by NVIDIA GPUs.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── GPU Tier definitions ────────────────────────────────────────────────────
const GPU_TIERS = {
  'A100': { vram: 80, fp16_tflops: 312, int8_tops: 624, nvlink: true },
  'H100': { vram: 80, fp16_tflops: 800, int8_tops: 3958, nvlink: true },
  'V100': { vram: 32, fp16_tflops: 130, int8_tops: 0,    nvlink: true },
  'T4':   { vram: 16, fp16_tflops: 65,  int8_tops: 130,  nvlink: false },
  'L4':   { vram: 24, fp16_tflops: 121, int8_tops: 242,  nvlink: false },
  'RTX4090': { vram: 24, fp16_tflops: 165, int8_tops: 330, nvlink: false },
};

// ─── Precision modes ─────────────────────────────────────────────────────────
const PRECISION_MODES = ['fp32', 'fp16', 'bf16', 'int8', 'int4'];

// ─── Load-balance strategies ─────────────────────────────────────────────────
const LB_STRATEGIES = {
  round_robin:   'Round Robin — distribute requests sequentially across nodes',
  least_loaded:  'Least Loaded — route to the node with lowest current batch queue',
  vram_weighted: 'VRAM-Weighted — route proportionally by available GPU VRAM',
  latency_aware: 'Latency Aware — route to the node with lowest recent p95 latency',
};

// ─── Pipeline state (in-memory, per-process) ─────────────────────────────────
const _nodes   = new Map();   // nodeId → NodeDescriptor
const _jobs    = new Map();   // jobId  → InferenceJob
let   _lbIdx   = 0;           // round-robin cursor

// ─── Helper utilities ────────────────────────────────────────────────────────

/**
 * Parse a VM-RAM string like "16GB" → number of GB (16).
 * Returns null if unparseable.
 */
function parseVmRamGB(vmRamStr) {
  if (!vmRamStr) return null;
  const m = String(vmRamStr).trim().match(/^(\d+(?:\.\d+)?)\s*(GB|MB|TB)?$/i);
  if (!m) return null;
  const val  = parseFloat(m[1]);
  const unit = (m[2] || 'GB').toUpperCase();
  if (unit === 'TB') return val * 1024;
  if (unit === 'MB') return val / 1024;
  return val;
}

/** Determine optimal batch size for a given model and GPU VRAM. */
function optimalBatchSize(modelSizeGB, gpuVramGB) {
  const usable = gpuVramGB * 0.85;          // keep 15% headroom
  const batchable = Math.floor(usable / modelSizeGB);
  return Math.max(1, Math.min(batchable, 256));
}

/** Estimate throughput (req/s) given GPU fp16 TFLOPS, model GFLOP/req, batch. */
function estimateThroughput(fp16_tflops, modelGflopsPerReq, batchSize) {
  if (!fp16_tflops || !modelGflopsPerReq) return null;
  const tflopsPerBatch = (modelGflopsPerReq * batchSize) / 1e3; // TFLOPS for one batch
  return Math.round((fp16_tflops / tflopsPerBatch) * batchSize);
}

/** Generate a simple unique ID. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ─── Node management ─────────────────────────────────────────────────────────

/**
 * Register a GPU node into the pipeline.
 * @param {object} opts
 * @param {string} opts.name         Human-readable node name
 * @param {string} opts.endpoint     TF-Serving gRPC or REST endpoint
 * @param {string} opts.gpuModel     One of the GPU_TIERS keys (e.g. "A100")
 * @param {number} opts.gpuCount     Number of GPUs on this node
 * @param {string} [opts.vmRam]      Host VM RAM string (e.g. "64GB")
 * @param {string} [opts.precision]  Default precision mode (default "fp16")
 * @returns {object} The registered node descriptor
 */
function registerNode({ name, endpoint, gpuModel, gpuCount = 1, vmRam, precision = 'fp16' }) {
  if (!name || !endpoint) throw new Error('name and endpoint are required');
  const gpuSpec = GPU_TIERS[gpuModel] || { vram: 16, fp16_tflops: 65, int8_tops: 0, nvlink: false };
  const vmRamGB = parseVmRamGB(vmRam);
  const nodeId  = uid();
  const node = {
    id:          nodeId,
    name,
    endpoint,
    gpuModel:    gpuModel || 'generic',
    gpuCount,
    gpuSpec,
    vmRamGB,
    precision:   PRECISION_MODES.includes(precision) ? precision : 'fp16',
    totalVramGB: gpuSpec.vram * gpuCount,
    status:      'idle',
    queueDepth:  0,
    p95LatencyMs: null,
    registeredAt: new Date().toISOString(),
  };
  _nodes.set(nodeId, node);
  return node;
}

/** Remove a node from the pipeline. */
function deregisterNode(nodeId) {
  return _nodes.delete(nodeId);
}

/** List all registered nodes. */
function listNodes() {
  return Array.from(_nodes.values());
}

/** Get a single node by ID. */
function getNode(nodeId) {
  return _nodes.get(nodeId) || null;
}

// ─── Load-balancing ───────────────────────────────────────────────────────────

/**
 * Select the best node for the next inference request.
 * @param {string} strategy  One of the LB_STRATEGIES keys
 * @returns {object|null}    Node descriptor or null if no nodes available
 */
function selectNode(strategy = 'round_robin') {
  const active = Array.from(_nodes.values()).filter(n => n.status !== 'error');
  if (active.length === 0) return null;

  switch (strategy) {
    case 'least_loaded':
      return active.reduce((best, n) => n.queueDepth < best.queueDepth ? n : best, active[0]);

    case 'vram_weighted': {
      const totalVram = active.reduce((s, n) => s + n.totalVramGB, 0);
      const rand      = Math.random() * totalVram;
      let cum = 0;
      for (const n of active) {
        cum += n.totalVramGB;
        if (rand < cum) return n;
      }
      return active[active.length - 1];
    }

    case 'latency_aware': {
      const withLatency = active.filter(n => n.p95LatencyMs !== null);
      if (withLatency.length === 0) return active[_lbIdx++ % active.length];
      return withLatency.reduce((best, n) => n.p95LatencyMs < best.p95LatencyMs ? n : best, withLatency[0]);
    }

    case 'round_robin':
    default:
      return active[_lbIdx++ % active.length];
  }
}

// ─── Inference job management ─────────────────────────────────────────────────

/**
 * Create and enqueue an inference job.
 * @param {object} opts
 * @param {string}   opts.modelName      TF model name (as registered on TF Serving)
 * @param {string}   [opts.modelVersion] Model version string (default "latest")
 * @param {number}   [opts.batchSize]    Override batch size (auto-computed if omitted)
 * @param {string}   [opts.precision]    Override precision for this job
 * @param {string}   [opts.strategy]     LB strategy for node selection
 * @param {object}   [opts.inputShape]   e.g. { width: 224, height: 224, channels: 3 }
 * @param {number}   [opts.modelSizeGB]  Approximate model weight size in GB (for batch sizing)
 * @returns {object} Job descriptor (id, nodeId, status, …)
 */
function createInferenceJob({
  modelName,
  modelVersion = 'latest',
  batchSize,
  precision,
  strategy = 'round_robin',
  inputShape = {},
  modelSizeGB = 1,
}) {
  if (!modelName) throw new Error('modelName is required');

  const node = selectNode(strategy);
  if (!node) throw new Error('No active GPU nodes available in the pipeline');

  const resolvedPrecision = precision || node.precision;
  const resolvedBatch     = batchSize || optimalBatchSize(modelSizeGB, node.totalVramGB);
  const jobId             = uid();

  const job = {
    id:           jobId,
    modelName,
    modelVersion,
    nodeId:       node.id,
    nodeName:     node.name,
    endpoint:     node.endpoint,
    batchSize:    resolvedBatch,
    precision:    resolvedPrecision,
    inputShape,
    modelSizeGB,
    strategy,
    status:       'queued',
    createdAt:    new Date().toISOString(),
    startedAt:    null,
    completedAt:  null,
    latencyMs:    null,
    error:        null,
  };

  // Update node queue depth
  node.queueDepth++;
  node.status = 'busy';

  _jobs.set(jobId, job);
  return job;
}

/** Mark a job as started. */
function startJob(jobId) {
  const job = _jobs.get(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  job.status    = 'running';
  job.startedAt = new Date().toISOString();
  return job;
}

/**
 * Mark a job as completed (or failed).
 * @param {string}  jobId
 * @param {boolean} success
 * @param {number}  [latencyMs]
 * @param {string}  [errorMsg]
 */
function completeJob(jobId, success = true, latencyMs = null, errorMsg = null) {
  const job = _jobs.get(jobId);
  if (!job) throw new Error(`Job ${jobId} not found`);
  job.status      = success ? 'completed' : 'failed';
  job.completedAt = new Date().toISOString();
  job.latencyMs   = latencyMs;
  job.error       = errorMsg || null;

  // Update node tracking
  const node = _nodes.get(job.nodeId);
  if (node) {
    node.queueDepth = Math.max(0, node.queueDepth - 1);
    if (node.queueDepth === 0) node.status = 'idle';
    if (latencyMs !== null) node.p95LatencyMs = latencyMs; // simplified p95 proxy
  }
  return job;
}

/** List all jobs (optionally filtered by status). */
function listJobs(status = null) {
  const all = Array.from(_jobs.values());
  return status ? all.filter(j => j.status === status) : all;
}

/** Get a job by ID. */
function getJob(jobId) {
  return _jobs.get(jobId) || null;
}

// ─── Cluster health summary ───────────────────────────────────────────────────

/**
 * Compute an aggregate health/capacity report for the pipeline.
 * @returns {object} Summary object
 */
function clusterReport() {
  const nodes     = listNodes();
  const jobs      = listJobs();
  const totalVram = nodes.reduce((s, n) => s + n.totalVramGB, 0);
  const busyNodes = nodes.filter(n => n.status === 'busy').length;
  const idleNodes = nodes.filter(n => n.status === 'idle').length;
  const errorNodes = nodes.filter(n => n.status === 'error').length;

  const completed = jobs.filter(j => j.status === 'completed');
  const avgLatency = completed.length
    ? Math.round(completed.reduce((s, j) => s + (j.latencyMs || 0), 0) / completed.length)
    : null;

  return {
    totalNodes:   nodes.length,
    idleNodes,
    busyNodes,
    errorNodes,
    totalVramGB:  totalVram,
    totalJobs:    jobs.length,
    queuedJobs:   jobs.filter(j => j.status === 'queued').length,
    runningJobs:  jobs.filter(j => j.status === 'running').length,
    completedJobs: completed.length,
    failedJobs:   jobs.filter(j => j.status === 'failed').length,
    avgLatencyMs: avgLatency,
    gpuTiers:     Object.keys(GPU_TIERS),
    lbStrategies: Object.keys(LB_STRATEGIES),
    precisionModes: PRECISION_MODES,
  };
}

// ─── Build a pipeline config from a cluster-links entry ──────────────────────

/**
 * Bootstrap pipeline nodes from a set of cluster-link records
 * (those with builderType === 'tensorflow').
 * @param {Array} clusterLinks  Array from cluster-links.json
 * @returns {Array}             Registered node descriptors
 */
function bootstrapFromClusterLinks(clusterLinks = []) {
  const registered = [];
  for (const link of clusterLinks) {
    if (link.builderType !== 'tensorflow') continue;
    try {
      const node = registerNode({
        name:     link.name,
        endpoint: link.endpoint,
        gpuModel: link.gpuModel || 'T4',
        gpuCount: link.gpuCount || 1,
        vmRam:    link.vmRam   || '',
        precision: link.precision || 'fp16',
      });
      registered.push(node);
    } catch {
      // skip malformed entries
    }
  }
  return registered;
}

module.exports = {
  GPU_TIERS,
  PRECISION_MODES,
  LB_STRATEGIES,
  parseVmRamGB,
  optimalBatchSize,
  estimateThroughput,
  registerNode,
  deregisterNode,
  listNodes,
  getNode,
  selectNode,
  createInferenceJob,
  startJob,
  completeJob,
  listJobs,
  getJob,
  clusterReport,
  bootstrapFromClusterLinks,
};
