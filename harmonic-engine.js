'use strict';
/**
 * QuanV1 Harmonic Engine — 369Hz Quantum-Classical Hybrid
 *
 * Implements:
 *  1. 369 Harmonic Grid  — Tesla's 3-6-9 digital root system, solfeggio
 *                          frequencies, vortex math doubling sequence
 *  2. Parallel Runner    — quantum + classical inference paths run via
 *                          Promise.all, merged by phase-weighted interference
 *  3. Reverse Engineering — DFT decomposition of merged conclusion vector
 *                          back to base harmonic components
 *  4. Topology Reinvention — rebuild circuit/mesh node ordering using
 *                            369Hz carrier harmonics and solfeggio spacings
 */
'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// § 1 — Tesla 3-6-9 Digital Root & Vortex Mathematics
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Digital root: recursively sum digits until single digit (1–9).
 * Tesla observed 3, 6, 9 never appear in the binary doubling sequence
 * 1→2→4→8→7→5→1→… They are the "source axis" of the vortex.
 */
function digitalRoot(n) {
  const abs = Math.abs(Math.round(n));
  if (abs === 0) return 0;
  return ((abs - 1) % 9) + 1;
}

/**
 * Vortex math doubling sequence mod 9 (Marko Rodin / Tesla).
 * Returns n steps of: 1, 2, 4, 8, 7, 5, 1, 2, 4, 8, 7, 5, …
 * Note: 3, 6, 9 never appear — they form the polar axis.
 */
function vortexSequence(n = 12) {
  const seq = [];
  let v = 1;
  for (let i = 0; i < n; i++) {
    seq.push(v);
    v = digitalRoot(v * 2);
    if (v === 9) v = 9; // 9 stays 9 (identity element)
  }
  return seq;
}

/**
 * Check whether a number belongs to the 3-6-9 axis.
 */
function is369(n) {
  const dr = digitalRoot(n);
  return dr === 3 || dr === 6 || dr === 9;
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 2 — 369 Hz Harmonic Grid & Solfeggio Frequencies
// ═══════════════════════════════════════════════════════════════════════════════

const CARRIER_HZ = 369;

/**
 * Carrier harmonics: 369×k for k=1..N.
 * Every harmonic has digital root 9 (369: 3+6+9=18→9, 738: 9, 1107: 9, …).
 */
function carrierHarmonics(n = 9) {
  return Array.from({ length: n }, (_, k) => {
    const freq = CARRIER_HZ * (k + 1);
    return { k: k + 1, freq, digitalRoot: digitalRoot(freq), axis: is369(freq) };
  });
}

/**
 * Solfeggio frequencies — all reduce to 3, 6, or 9 via digital root.
 */
const SOLFEGGIO = [
  { name: 'UT',  hz: 396,  note: 'C',  meaning: 'Liberation from fear',       dr: 9 },
  { name: 'RE',  hz: 417,  note: 'D',  meaning: 'Facilitating change',         dr: 3 },
  { name: 'MI',  hz: 528,  note: 'E',  meaning: 'Transformation / DNA repair', dr: 6 },
  { name: 'FA',  hz: 639,  note: 'F',  meaning: 'Reconnecting relationships',  dr: 9 },
  { name: 'SOL', hz: 741,  note: 'G',  meaning: 'Awakening intuition',          dr: 3 },
  { name: 'LA',  hz: 852,  note: 'A',  meaning: 'Returning to spiritual order', dr: 6 },
  { name: 'SI',  hz: 963,  note: 'B',  meaning: 'Divine consciousness',         dr: 9 },
];

/** Sub-fundamental 369 triad (3, 6, 9 Hz base) */
const BASE_TRIAD = [
  { hz: 3,   axis: 3, label: 'Tesla-3',  role: 'foundation' },
  { hz: 6,   axis: 6, label: 'Tesla-6',  role: 'bridge'     },
  { hz: 9,   axis: 9, label: 'Tesla-9',  role: 'apex'       },
  { hz: 369, axis: 9, label: 'Carrier',  role: 'carrier'    },
];

/**
 * Project a scalar value onto the nearest 369-harmonic grid point.
 * The grid is: { n × 3, n × 6, n × 9 : n ∈ ℕ } ∪ { 369 × k }
 */
function nearestHarmonic(value) {
  const candidates = [];
  for (let n = 1; n <= 100; n++) {
    candidates.push(n * 3, n * 6, n * 9);
  }
  for (let k = 1; k <= 20; k++) candidates.push(CARRIER_HZ * k);
  candidates.push(...SOLFEGGIO.map(s => s.hz));
  let best = candidates[0], bestDist = Math.abs(value - candidates[0]);
  for (const c of candidates) {
    const d = Math.abs(value - c);
    if (d < bestDist) { best = c; bestDist = d; }
  }
  return { original: value, nearest: best, dist: bestDist, digitalRoot: digitalRoot(best), axis: is369(best) };
}

/**
 * Normalise an array of weights so they sum to 1, then scale each element
 * to its nearest 369-harmonic proportion.
 * Returns both the raw harmonised weights and the aligned 369 positions.
 */
function harmonise369(weights) {
  const total = weights.reduce((s, w) => s + Math.abs(w), 0) || 1;
  return weights.map((w, i) => {
    const norm = Math.abs(w) / total;
    // Map normalised weight into [0, CARRIER_HZ] range then snap to grid
    const scaled = norm * CARRIER_HZ;
    const snapped = nearestHarmonic(scaled);
    return {
      index: i,
      original: w,
      normalised: parseFloat(norm.toFixed(6)),
      scaledToHz: parseFloat(scaled.toFixed(3)),
      snappedHz: snapped.nearest,
      digitalRoot: snapped.digitalRoot,
      is369axis: snapped.axis,
      harmonicWeight: parseFloat((snapped.nearest / CARRIER_HZ).toFixed(6)),
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 3 — Discrete Fourier Transform (manual, no dependencies)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Naive O(N²) DFT of a real signal. Returns magnitude and phase for each bin.
 * Used for reverse engineering: decompose merged conclusion vector into
 * constituent frequency components, then identify dominant harmonics.
 */
function dft(signal) {
  const N = signal.length;
  const result = [];
  for (let k = 0; k < N; k++) {
    let re = 0, im = 0;
    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * k * n) / N;
      re += signal[n] * Math.cos(phi);
      im -= signal[n] * Math.sin(phi);
    }
    result.push({
      bin: k,
      re: parseFloat((re / N).toFixed(6)),
      im: parseFloat((im / N).toFixed(6)),
      magnitude: parseFloat((Math.sqrt(re * re + im * im) / N).toFixed(6)),
      phase: parseFloat((Math.atan2(im, re)).toFixed(6)),
    });
  }
  return result;
}

/**
 * Inverse DFT — reconstruct signal from frequency bins.
 */
function idft(bins) {
  const N = bins.length;
  return Array.from({ length: N }, (_, n) => {
    let val = 0;
    for (const { bin: k, re, im } of bins) {
      const phi = (2 * Math.PI * k * n) / N;
      val += re * Math.cos(phi) - im * Math.sin(phi);
    }
    return parseFloat(val.toFixed(6));
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 4 — Quantum ↔ Classical Parallel Runner
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Simulate quantum inference path:
 * Encode input vector as amplitude distribution, apply Hadamard-style
 * interference, return probability outcome with phase information.
 */
function quantumPath(inputVector) {
  const N = inputVector.length;
  // Normalise to amplitude
  const norm = Math.sqrt(inputVector.reduce((s, x) => s + x * x, 0)) || 1;
  const amps = inputVector.map(x => x / norm);

  // Hadamard-style transform (discrete Walsh-Hadamard on 8 elements)
  const H = [...amps];
  let step = 1;
  while (step < N) {
    for (let i = 0; i < N; i += step * 2) {
      for (let j = i; j < i + step; j++) {
        const a = H[j], b = H[j + step] || 0;
        H[j]        = (a + b) / Math.SQRT2;
        H[j + step] = (a - b) / Math.SQRT2;
      }
    }
    step *= 2;
  }

  // Add phase-decoherence noise (quantum realism — finite coherence)
  const decohered = H.map((amp, i) => {
    const phase = (i * Math.PI * CARRIER_HZ) % (2 * Math.PI);
    return amp * Math.cos(phase);   // project onto real axis (measurement)
  });

  const probs = decohered.map(a => a * a);
  const probSum = probs.reduce((s, p) => s + p, 0) || 1;
  return {
    path: 'quantum',
    amplitudes: H.map(a => parseFloat(a.toFixed(6))),
    probabilities: probs.map(p => parseFloat((p / probSum).toFixed(6))),
    phaseCoherence: parseFloat((1 - Math.abs(decohered.reduce((s, a) => s + a, 0) / N)).toFixed(4)),
    dominantBin: probs.indexOf(Math.max(...probs)),
  };
}

/**
 * Simulate classical inference path:
 * Deterministic weighted softmax with temperature-controlled sharpness.
 */
function classicalPath(inputVector, temperature = 1.0) {
  const N = inputVector.length;
  // Softmax at given temperature
  const maxV = Math.max(...inputVector);
  const exps = inputVector.map(v => Math.exp((v - maxV) / temperature));
  const expSum = exps.reduce((s, e) => s + e, 0) || 1;
  const softmax = exps.map(e => e / expSum);

  // Classical Bayesian update (uniform prior × likelihood)
  const prior = new Array(N).fill(1 / N);
  const posterior = softmax.map((s, i) => s * prior[i]);
  const postSum = posterior.reduce((s, p) => s + p, 0) || 1;
  const normalised = posterior.map(p => p / postSum);

  return {
    path: 'classical',
    softmax: softmax.map(v => parseFloat(v.toFixed(6))),
    posterior: normalised.map(v => parseFloat(v.toFixed(6))),
    temperature,
    dominantBin: normalised.indexOf(Math.max(...normalised)),
    certainty: parseFloat(Math.max(...normalised).toFixed(4)),
  };
}

/**
 * Merge quantum and classical outcomes via phase-weighted interference.
 * α = cos²(t × 2π / 369) — cycles with the 369Hz carrier period.
 */
function mergeOutcomes(quantum, classical) {
  const t = Date.now() % (1000 / CARRIER_HZ); // time within one carrier cycle (ms)
  const phi = (t * 2 * Math.PI * CARRIER_HZ) / 1000;
  const alpha = Math.cos(phi) ** 2;            // quantum weight (0–1)
  const beta  = 1 - alpha;                     // classical weight (0–1)

  const N = Math.min(quantum.probabilities.length, classical.posterior.length);
  const merged = Array.from({ length: N }, (_, i) => {
    const q = quantum.probabilities[i] || 0;
    const c = classical.posterior[i]  || 0;
    // Constructive interference where both agree; destructive where they diverge
    const interference = Math.sqrt(q * c) * Math.cos(phi);
    return parseFloat((alpha * q + beta * c + 0.15 * interference).toFixed(6));
  });

  // Renormalise
  const mSum = merged.reduce((s, v) => s + v, 0) || 1;
  const normalised = merged.map(v => parseFloat((v / mSum).toFixed(6)));

  return {
    alpha: parseFloat(alpha.toFixed(4)),
    beta:  parseFloat(beta.toFixed(4)),
    phase: parseFloat(phi.toFixed(4)),
    merged: normalised,
    dominantBin: normalised.indexOf(Math.max(...normalised)),
    divergence: parseFloat(
      Math.sqrt(normalised.reduce((s, v, i) =>
        s + (v - (quantum.probabilities[i] || 0)) ** 2, 0) / N
      ).toFixed(4)
    ),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 5 — Reverse Engineering Conclusions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Reverse-engineer merged conclusion vector:
 *  1. DFT decompose to find dominant frequency bins
 *  2. Map bins to nearest 369-harmonic / solfeggio frequencies
 *  3. Reconstruct the "harmonic DNA" — which Tesla axis drives each bin
 *  4. Identify latent patterns hidden in the interference
 */
function reverseEngineer(mergedVector, labels = []) {
  const bins = dft(mergedVector);

  // Sort bins by magnitude descending
  const dominant = [...bins].sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);

  // Map each dominant bin to a 369-harmonic frequency
  // Bin k corresponds to physical frequency: f_k = k × f_sample / N
  // We use 369Hz as our sample rate metaphor
  const harmonicDNA = dominant.map(bin => {
    const physFreq = bin.bin * (CARRIER_HZ / mergedVector.length);
    const snapped  = nearestHarmonic(physFreq || 1);
    const solfegio = SOLFEGGIO.reduce((best, s) =>
      Math.abs(s.hz - physFreq) < Math.abs(best.hz - physFreq) ? s : best
    , SOLFEGGIO[0]);
    return {
      bin: bin.bin,
      label: labels[bin.bin] || `element_${bin.bin}`,
      physFreqHz: parseFloat(physFreq.toFixed(3)),
      magnitude: bin.magnitude,
      phase: bin.phase,
      nearest369: snapped.nearest,
      digitalRoot: snapped.digitalRoot,
      is369axis: snapped.axis,
      nearestSolfeggio: solfegio,
      latentPattern: snapped.axis
        ? `Tesla ${snapped.digitalRoot}-axis resonance`
        : `Harmonic ${bin.bin} — dr${snapped.digitalRoot}`,
    };
  });

  // Identify overall 369 axis dominance
  const axisCounts = { 3: 0, 6: 0, 9: 0, other: 0 };
  harmonicDNA.forEach(h => {
    if (h.digitalRoot === 3) axisCounts[3]++;
    else if (h.digitalRoot === 6) axisCounts[6]++;
    else if (h.digitalRoot === 9) axisCounts[9]++;
    else axisCounts.other++;
  });
  const dominantAxis = Object.entries(axisCounts).sort(([, a], [, b]) => b - a)[0][0];

  return {
    dftBins: bins,
    harmonicDNA,
    axisCounts,
    dominantAxis: dominantAxis === 'other' ? 'mixed' : `Tesla-${dominantAxis}`,
    reconstructed: idft(bins.slice(0, Math.ceil(bins.length / 2))),
    interpretation: `Dominant harmonic signature: ${dominantAxis === 'other' ? 'mixed frequencies' : `Tesla ${dominantAxis}-axis`}. `
      + `Top component at ${harmonicDNA[0]?.physFreqHz || 0}Hz → ${harmonicDNA[0]?.nearestSolfeggio?.meaning || 'unknown'}.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 6 — Topology Reinvention via 369Hz Harmonics
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Given a topology (nodes + edges), reinvent it by:
 *  1. Assign each node a solfeggio frequency based on its index and role
 *  2. Reorder the node sequence so gate execution follows the
 *     vortex-math doubling path (1-2-4-8-7-5-1-2-…)
 *  3. Reweight edges using harmonic ratios (1:2:3 perfect fifth / octave)
 *  4. Flag any node whose digital root is 3, 6, or 9 as a "Tesla node"
 *     (these are the "source" nodes — highest structural importance)
 */
function reinventTopology(topology) {
  const { nodes = [], edges = [] } = topology;

  // Step 1 — assign solfeggio frequencies to nodes
  const harmonisedNodes = nodes.map((node, i) => {
    const solFreq = SOLFEGGIO[i % SOLFEGGIO.length];
    const dr = digitalRoot(i + 1);
    const isTesla = is369(i + 1);
    return {
      ...node,
      harmonicFreqHz: solFreq.hz,
      harmonicNote: solFreq.note,
      harmonicMeaning: solFreq.meaning,
      digitalRoot: dr,
      teslaNode: isTesla,
      harmonicPriority: isTesla ? 'SOURCE' : 'FLOW',
      vortexPosition: ((i) % 6) + 1, // position in vortex sequence 1-2-4-8-7-5
    };
  });

  // Step 2 — reorder execution sequence via vortex doubling
  const vortexSeq = vortexSequence(nodes.length + 6);
  const reorderedSequence = [];
  const usedIdx = new Set();

  // First: Tesla nodes (3, 6, 9 digital roots) — they anchor the topology
  harmonisedNodes.forEach((n, i) => { if (n.teslaNode && !usedIdx.has(i)) { reorderedSequence.push(i); usedIdx.add(i); } });
  // Then: follow vortex sequence for remaining
  for (const vStep of vortexSeq) {
    const idx = (vStep - 1) % nodes.length;
    if (!usedIdx.has(idx)) { reorderedSequence.push(idx); usedIdx.add(idx); }
  }
  // Append any remaining
  harmonisedNodes.forEach((_, i) => { if (!usedIdx.has(i)) reorderedSequence.push(i); });

  // Step 3 — reweight edges by harmonic ratio
  const harmonisedEdges = edges.map((edge, i) => {
    // Harmonic ratios: unison(1:1), octave(2:1), fifth(3:2), fourth(4:3), …
    const harmonicRatios = [1, 0.5, 0.667, 0.75, 0.8, 0.833, 0.857, 0.875, 0.889];
    const ratio = harmonicRatios[i % harmonicRatios.length];
    const baseWeight = edge.weight || edge.error_rate || 0.01;
    const reweighted = parseFloat((baseWeight * ratio).toFixed(6));
    const dr = digitalRoot(Math.round(reweighted * 1000));
    return {
      ...edge,
      originalWeight: baseWeight,
      harmonicRatio: ratio,
      harmonicWeight: reweighted,
      digitalRoot: dr,
      tesla369resonance: is369(Math.round(reweighted * 1000)),
      harmonicLabel: `${SOLFEGGIO[i % SOLFEGGIO.length].name}(${SOLFEGGIO[i % SOLFEGGIO.length].hz}Hz)`,
    };
  });

  // Step 4 — compute topology 369 score
  const tesla369Score = harmonisedNodes.filter(n => n.teslaNode).length / (nodes.length || 1);
  const edgeResonance = harmonisedEdges.filter(e => e.tesla369resonance).length / (edges.length || 1);

  return {
    originalNodeCount: nodes.length,
    originalEdgeCount: edges.length,
    harmonisedNodes,
    harmonisedEdges,
    reinventedSequence: reorderedSequence.map(i => harmonisedNodes[i]?.id || i),
    tesla369Score: parseFloat(tesla369Score.toFixed(4)),
    edgeResonanceScore: parseFloat(edgeResonance.toFixed(4)),
    overallHarmonicScore: parseFloat(((tesla369Score + edgeResonance) / 2).toFixed(4)),
    carrierHz: CARRIER_HZ,
    solfeggio: SOLFEGGIO,
    vortexSequenceUsed: vortexSeq,
    interpretation:
      `${(tesla369Score * 100).toFixed(0)}% of nodes are Tesla 3-6-9 source nodes. `
      + `Edge resonance: ${(edgeResonance * 100).toFixed(0)}%. `
      + `Topology reinvented to 369Hz harmonic alignment.`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// § 7 — Full Harmonic Engine Pipeline
// ═══════════════════════════════════════════════════════════════════════════════

class HarmonicEngine {
  constructor() {
    this.runHistory  = [];
    this.carrier     = CARRIER_HZ;
    this.solfeggio   = SOLFEGGIO;
    this.basTriad    = BASE_TRIAD;
  }

  /**
   * Master pipeline:
   *  1. Run quantum + classical in parallel on inputVector
   *  2. Merge outcomes via 369Hz phase-weighted interference
   *  3. Reverse-engineer merged conclusions
   *  4. Reinvent topology using harmonic sequence
   *  5. Return full harmonic analysis
   */
  async run(inputVector, topology = {}, labels = []) {
    const t0 = Date.now();

    // Step 1 — Parallel quantum + classical paths
    const [qResult, cResult] = await Promise.all([
      Promise.resolve(quantumPath(inputVector)),
      Promise.resolve(classicalPath(inputVector)),
    ]);

    // Step 2 — Merge
    const merged = mergeOutcomes(qResult, cResult);

    // Step 3 — Reverse engineer
    const reverse = reverseEngineer(merged.merged, labels);

    // Step 4 — Reinvent topology
    const reinvented = (topology.nodes && topology.nodes.length > 0)
      ? reinventTopology(topology)
      : null;

    // Step 5 — Harmonise the merged weights themselves
    const harmonisedWeights = harmonise369(merged.merged);

    const result = {
      timestamp: new Date().toISOString(),
      pipelineMs: Date.now() - t0,
      inputVector,
      labels,

      // Parallel paths
      quantumPath: qResult,
      classicalPath: cResult,

      // Merged interference
      merge: merged,

      // Reverse engineering
      reverseEngineering: reverse,

      // Harmonised weights
      harmonisedWeights,

      // Topology reinvention
      topologyReinvention: reinvented,

      // 369 metadata
      carrierHz: CARRIER_HZ,
      digitalRootOfCarrier: digitalRoot(CARRIER_HZ),
      vortexSequence: vortexSequence(9),
      tesla369Summary: {
        dominantAxis: reverse.dominantAxis,
        interpretation: reverse.interpretation,
        topologyScore: reinvented?.overallHarmonicScore ?? null,
        harmonicDNA: reverse.harmonicDNA.slice(0, 3).map(h =>
          `${h.physFreqHz}Hz→${h.nearest369}Hz(dr${h.digitalRoot})`),
      },
    };

    this.runHistory.push({
      ts: result.timestamp,
      ms: result.pipelineMs,
      axis: result.tesla369Summary.dominantAxis,
      dominant: reverse.harmonicDNA[0]?.physFreqHz,
    });
    if (this.runHistory.length > 200) this.runHistory.shift();
    return result;
  }

  /** Utility: get full static 369 reference tables */
  reference() {
    return {
      carrier: CARRIER_HZ,
      baseTriad: BASE_TRIAD,
      solfeggio: SOLFEGGIO,
      carrierHarmonics: carrierHarmonics(12),
      vortexSequence: vortexSequence(18),
      teslaNote: 'The vortex doubling sequence 1-2-4-8-7-5 never produces 3, 6, or 9. '
        + 'Tesla\'s "key to the universe": 3, 6, 9 form the polar axis of all energy.',
    };
  }

  status() {
    return {
      carrier: CARRIER_HZ,
      runsTotal: this.runHistory.length,
      recentRuns: this.runHistory.slice(-5),
    };
  }
}

// Singleton
const harmonicEngine = new HarmonicEngine();

module.exports = {
  harmonicEngine,
  HarmonicEngine,
  // Utility exports for direct use in routes / views
  digitalRoot,
  vortexSequence,
  is369,
  carrierHarmonics,
  harmonise369,
  nearestHarmonic,
  SOLFEGGIO,
  BASE_TRIAD,
  CARRIER_HZ,
  dft,
  idft,
  reverseEngineer,
  reinventTopology,
  quantumPath,
  classicalPath,
  mergeOutcomes,
};
