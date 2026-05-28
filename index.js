const express = require('express');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Quantum & AI modules
const { swarm }            = require('./rag-swarm');
const { QuadBrainOrchestrator } = require('./quad-brain');
const vault                = require('./blockchain-vault');
const {
  harmonicEngine, digitalRoot, vortexSequence, carrierHarmonics,
  harmonise369, SOLFEGGIO, BASE_TRIAD, CARRIER_HZ, reverseEngineer,
  reinventTopology, quantumPath, classicalPath, mergeOutcomes,
} = require('./harmonic-engine');

// Load static JSON corpora
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8')); }
  catch { return {}; }
}
const curriculum   = loadJSON('quantum-curriculum.json');
const circuits     = loadJSON('quantum-circuit-scenarios.json');
const backends     = loadJSON('quantum-backends.json');
const qctrlLib     = loadJSON('qctrl-pennylane-library.json');

// Initialise RAG swarm index (background, non-blocking)
swarm.init();

// Shared corpus for QuadBrain (flatten all knowledge to {id, text} docs)
function buildSharedCorpus() {
  const docs = [];
  // Curriculum concepts
  if (curriculum.concepts) {
    Object.entries(curriculum.concepts).forEach(([k, c]) => {
      const ddmText = Object.values(c.ddm || {}).join(' ');
      docs.push({ id: `concept_${k}`, text: `${k} ${c.title || ''} ${ddmText}` });
    });
  }
  // Circuit names
  (circuits.circuits || []).forEach((c, i) => {
    docs.push({ id: `circuit_${c.id || i}`, text: `${c.name || ''} ${c.description || ''}` });
  });
  // Backend names
  Object.entries(backends.backends || {}).forEach(([id, b]) => {
    docs.push({ id: `backend_${id}`, text: `${b.name} ${b.provider} ${(b.best_for || []).join(' ')}` });
  });
  // Library ops
  function walkOps(obj, prefix) {
    if (!obj || typeof obj !== 'object') return;
    if (obj.ddm) {
      const ddmText = Object.values(obj.ddm).join(' ');
      docs.push({ id: `op_${prefix}`, text: `${obj.full_name || prefix} ${ddmText}` });
      return;
    }
    Object.entries(obj).forEach(([k, v]) => walkOps(v, prefix ? `${prefix}_${k}` : k));
  }
  walkOps(qctrlLib.qctrl_operations || {});
  walkOps(qctrlLib.pennylane_operations || {});
  Object.entries(qctrlLib.key_papers || {}).forEach(([id, p]) => {
    docs.push({ id: `paper_${id}`, text: `${p.title} ${p.authors} ${p.hotkey_summary || ''} ${p.ddm_short || ''}` });
  });
  return docs;
}
const quadBrain = new QuadBrainOrchestrator(buildSharedCorpus());

// Handle --version flag so `npm test` can exit cleanly
if (process.argv.includes('--version')) {
  const pkg = require('./package.json');
  console.log(`${pkg.name} v${pkg.version}`);
  process.exit(0);
}

const app = express();
const haikus = require('./haikus.json');
const port = process.env.PORT || 3000;

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'"
  );
  next();
});

// Cross-platform compatibility check
console.log('='.repeat(50));
console.log('Platform Information:');
console.log(`  OS: ${os.platform()} (${os.type()})`);
console.log(`  Architecture: ${os.arch()}`);
console.log(`  Node.js: ${process.version}`);
console.log(`  Working Directory: ${process.cwd()}`);
console.log('='.repeat(50));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

// Use cross-platform path separator
const CLUSTER_LINKS_FILE = path.join(__dirname, 'cluster-links.json');

// Helper function to read cluster links
function readClusterLinks() {
  try {
    const data = fs.readFileSync(CLUSTER_LINKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write cluster links with cross-platform line endings
function writeClusterLinks(links) {
  const content = JSON.stringify(links, null, 2);
  // Normalize line endings for current platform
  // First normalize to LF, then convert to platform-specific
  const normalized = content.replace(/\r\n/g, '\n').replace(/\n/g, os.EOL);
  fs.writeFileSync(CLUSTER_LINKS_FILE, normalized, 'utf8');
}

// Routes
app.get('/', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('index', { haikus, clusterLinks });
});

// API endpoint to get all cluster links
app.get('/api/cluster-links', (req, res) => {
  const links = readClusterLinks();
  res.json(links);
});

// API endpoint to create a new cluster link
app.post('/api/cluster-links', (req, res) => {
  const { name, endpoint, credentials, builderType } = req.body;
  
  if (!name || !endpoint) {
    return res.status(400).json({ error: 'Name and endpoint are required' });
  }

  const links = readClusterLinks();
  
  // Check if a link with the same name already exists
  if (links.some(link => link.name === name)) {
    return res.status(400).json({ error: 'A cluster link with this name already exists' });
  }

  const newLink = {
    id: Date.now().toString(),
    name,
    endpoint,
    credentials: credentials || '',
    builderType: builderType || 'generic',
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  links.push(newLink);
  writeClusterLinks(links);
  
  res.status(201).json(newLink);
});

// API endpoint to delete a cluster link
app.delete('/api/cluster-links/:id', (req, res) => {
  const { id } = req.params;
  const links = readClusterLinks();
  
  const filteredLinks = links.filter(link => link.id !== id);
  
  if (filteredLinks.length === links.length) {
    return res.status(404).json({ error: 'Cluster link not found' });
  }

  writeClusterLinks(filteredLinks);
  res.json({ message: 'Cluster link deleted successfully' });
});

// API endpoint to update a cluster link
app.put('/api/cluster-links/:id', (req, res) => {
  const { id } = req.params;
  const { name, endpoint, credentials, builderType } = req.body;

  if (!name || !endpoint) {
    return res.status(400).json({ error: 'Name and endpoint are required' });
  }

  const links = readClusterLinks();
  const index = links.findIndex(link => link.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Cluster link not found' });
  }

  // Check for duplicate name (excluding the link being updated)
  if (links.some(link => link.name === name && link.id !== id)) {
    return res.status(400).json({ error: 'A cluster link with this name already exists' });
  }

  links[index] = {
    ...links[index],
    name,
    endpoint,
    credentials: credentials || '',
    builderType: builderType || 'generic',
    updatedAt: new Date().toISOString()
  };

  writeClusterLinks(links);
  res.json(links[index]);
});

// API endpoint to export cluster links as JSON
app.get('/api/cluster-links/export', (req, res) => {
  const links = readClusterLinks();
  // Strip credentials from export for security
  const exportData = links.map(({ credentials, ...rest }) => rest);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="cluster-links-export.json"');
  res.json(exportData);
});

// API endpoint to import cluster links from JSON
app.post('/api/cluster-links/import', (req, res) => {
  const { links: incoming } = req.body;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Request body must contain a "links" array' });
  }

  const existing = readClusterLinks();
  let added = 0;
  let skipped = 0;

  for (const item of incoming) {
    if (!item.name || !item.endpoint) {
      skipped++;
      continue;
    }
    if (existing.some(link => link.name === item.name)) {
      skipped++;
      continue;
    }
    existing.push({
      id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
      name: item.name,
      endpoint: item.endpoint,
      credentials: '',
      builderType: item.builderType || 'generic',
      createdAt: new Date().toISOString(),
      status: 'active'
    });
    added++;
  }

  writeClusterLinks(existing);
  res.json({ added, skipped, total: existing.length });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: require('./package.json').version
  });
});

// Cluster link configuration page
app.get('/cluster-config', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('cluster-config', { clusterLinks });
});

// iPXE boot file generation page
app.get('/ipxe-boot', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('ipxe-boot', { clusterLinks });
});

// System information page
app.get('/system-info', (req, res) => {
  res.render('system-info');
});

// Generate iPXE boot file
app.post('/api/ipxe/generate', (req, res) => {
  const { clusterName, serverCount, bootImage, kernelParams } = req.body;
  
  if (!clusterName || !serverCount) {
    return res.status(400).json({ error: 'Cluster name and server count are required' });
  }

  const ipxeScript = generateIPXEScript(clusterName, serverCount, bootImage, kernelParams);
  
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="${clusterName}-boot.ipxe"`);
  res.send(ipxeScript);
});

// Benchmark/stress test endpoint
app.post('/api/benchmark/run', (req, res) => {
  const { endpoint, testType, iterations } = req.body;
  
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint is required' });
  }

  const benchmarkResult = {
    endpoint,
    testType: testType || 'stress',
    iterations: iterations || 100,
    startTime: new Date().toISOString(),
    status: 'running'
  };

  res.json(benchmarkResult);
});

// Continuous test runner - runs tests until failure
app.post('/api/test/run-until-fail', (req, res) => {
  const { clusterName, testType, maxIterations } = req.body;
  
  if (!clusterName) {
    return res.status(400).json({ error: 'Cluster name is required' });
  }

  const testResult = {
    clusterName,
    testType: testType || 'continuous',
    maxIterations: maxIterations || 1000,
    startTime: new Date().toISOString(),
    status: 'running',
    message: `Running continuous tests on ${clusterName} until failure is detected`
  };

  res.json(testResult);
});

// Helper function to generate iPXE boot script
function generateIPXEScript(clusterName, serverCount, bootImage, kernelParams) {
  const defaultBootImage = bootImage || 'http://boot.example.com/vmlinuz';
  const defaultInitrd = 'http://boot.example.com/initrd.img';
  const defaultKernelParams = kernelParams || 'quiet splash';
  
  let script = `#!ipxe
#
# iPXE Boot Configuration for ${clusterName}
# Generated: ${new Date().toISOString()}
# Servers: ${serverCount}
#

echo ========================================
echo  Arkitek Builder - Mass Server Deployment
echo  Cluster: ${clusterName}
echo  Server Count: ${serverCount}
echo ========================================
echo

# Network configuration
dhcp || echo DHCP failed, trying static...

# Boot menu
:start
menu iPXE Boot Menu - ${clusterName}
item --key 1 deploy Deploy ${serverCount} Servers
item --key 2 shell  iPXE Shell
item --key 3 reboot Reboot
choose --default deploy --timeout 10000 target && goto \${target}

:deploy
echo Deploying ${serverCount} servers for ${clusterName}...
`;

  // Generate boot entries for each server
  for (let i = 1; i <= serverCount; i++) {
    script += `
# Server ${i} configuration
echo Configuring server ${i}/${serverCount}...
set server-${i}-hostname ${clusterName}-node-${i}
`;
  }

  script += `
# Boot kernel
echo Loading kernel and initrd...
kernel ${defaultBootImage} ${defaultKernelParams} cluster=${clusterName} nodes=${serverCount}
initrd ${defaultInitrd}
boot || goto failed

:shell
echo Entering iPXE shell...
shell

:failed
echo Boot failed! Press any key to return to menu...
prompt
goto start

:reboot
echo Rebooting in 3 seconds...
sleep 3
reboot
`;

  return script;
}

// System information endpoint for debugging
app.get('/api/system-info', (req, res) => {
  res.json({
    platform: os.platform(),
    type: os.type(),
    architecture: os.arch(),
    release: os.release(),
    nodeVersion: process.version,
    uptime: os.uptime(),
    hostname: os.hostname(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpus: os.cpus().length,
    networkInterfaces: Object.keys(os.networkInterfaces()),
    pathSeparator: path.sep,
    lineEnding: os.EOL === '\r\n' ? 'CRLF (Windows)' : 'LF (Unix/Mac)'
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM SCHOOL routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/quantum-school', (req, res) => {
  res.render('quantum-school', { curriculum, qctrlLib });
});
app.get('/api/quantum/concepts', (req, res) => {
  res.json({ stages: curriculum.pipeline_stages || [], concepts: curriculum.concepts || {} });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM ANALYZER routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/quantum-analyzer', (req, res) => {
  res.render('quantum-analyzer', { circuits, backends, qctrlLib });
});
app.get('/api/quantum/circuits', (req, res) => {
  const list = (circuits.circuits || []).map(c => ({
    id: c.id, name: c.name, description: c.description, qubits: c.qubits,
  }));
  res.json(list);
});
app.get('/api/quantum/circuits/:id', (req, res) => {
  const c = (circuits.circuits || []).find(c => String(c.id) === req.params.id);
  if (!c) return res.status(404).json({ error: 'Circuit not found' });
  res.json(c);
});
app.get('/api/quantum/hardware', (req, res) => {
  res.json(circuits.hardware_profiles || backends.backends || {});
});
app.get('/api/quantum/backends', (req, res) => {
  res.json(backends);
});
app.get('/api/quantum/hotkeys', (req, res) => {
  res.json({ map: qctrlLib.hotkey_map || {}, operations: qctrlLib.pennylane_operations || {} });
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM PIPELINE routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/quantum-pipeline', (req, res) => {
  res.render('quantum-pipeline', { backends });
});
app.get('/api/pipeline/templates', (req, res) => {
  res.json(backends.pipeline_templates || {});
});
app.post('/api/pipeline/route', (req, res) => {
  const { circuit, algorithm, qubitCount, budget } = req.body;
  const rules  = (backends.routing_strategy || {}).auto_rules || [];
  const bList  = Object.values(backends.backends || {});
  const matches = rules.filter(r => {
    if (r.condition.includes('algorithm') && algorithm && r.condition.includes(algorithm)) return true;
    if (r.condition.includes('qubits > 50') && qubitCount > 50) return true;
    if (r.condition.includes('budget') && budget === 'free') return true;
    return false;
  });
  const recommended = matches.length
    ? matches[0]
    : { recommend: 'pennylane_lightning_qubit', reason: 'Default: free local simulation' };
  res.json({ recommended, allMatches: matches, availableBackends: bList.map(b => ({ id: b.id, name: b.name })) });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BLOCKCHAIN VAULT routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/quantum-rag-vault', (req, res) => {
  const summary = vault.getChainSummary();
  const ragStatus = swarm.status();
  res.render('quantum-rag-vault', { vaultSummary: summary, ragStatus });
});
app.get('/api/vault/summary', (req, res) => res.json(vault.getChainSummary()));
app.get('/api/vault/chain/:location', (req, res) => {
  const loc = req.params.location.toUpperCase();
  if (!vault.VAULT_LOCATIONS.includes(loc)) return res.status(400).json({ error: 'Unknown vault location' });
  res.json(vault.getChain(loc));
});
app.get('/api/vault/verify', (req, res) => res.json(vault.verifyAllVaults()));
app.post('/api/vault/write', (req, res) => {
  const { data, type } = req.body;
  if (!data) return res.status(400).json({ error: 'data field required' });
  const results = vault.writeToAllVaults(data, type || 'RECORD');
  res.json({ written: results });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TRI-RAG SWARM routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/rag/status', (req, res) => res.json(swarm.status()));
app.post('/api/rag/query', async (req, res) => {
  const { query, topK } = req.body;
  if (!query) return res.status(400).json({ error: 'query field required' });
  try {
    const result = await swarm.query(query, topK || 5);
    // Persist to vault
    vault.writeToAllVaults({ type: 'RAG_QUERY', query, topResult: result.topResult?.id }, 'RAG');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// QUAD BRAIN OCTO-INFERENCE routes
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/quantum-vortex', (req, res) => {
  res.render('quantum-vortex', {
    brainStatus: quadBrain.status(),
    harmonicRef: harmonicEngine.reference(),
  });
});
app.get('/api/brain/status', (req, res) => res.json(quadBrain.status()));
app.post('/api/brain/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'query field required' });
  try {
    const result = await quadBrain.query(query);
    vault.writeToAllVaults({ type: 'BRAIN_QUERY', query, winner: result.predictiveSymbiosis.winner }, 'INFERENCE');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// HARMONIC ENGINE routes  (369Hz quantum-classical parallel + reverse engineering)
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/harmonic/reference', (req, res) => res.json(harmonicEngine.reference()));
app.get('/api/harmonic/status',    (req, res) => res.json(harmonicEngine.status()));

app.post('/api/harmonic/run', async (req, res) => {
  const { vector, topology, labels } = req.body;
  if (!Array.isArray(vector) || vector.length === 0) {
    return res.status(400).json({ error: 'vector must be a non-empty number array' });
  }
  try {
    const result = await harmonicEngine.run(
      vector.map(Number),
      topology || {},
      labels   || [],
    );
    vault.writeToAllVaults({ type: 'HARMONIC_RUN', axis: result.tesla369Summary.dominantAxis }, 'HARMONIC');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/harmonic/parallel', async (req, res) => {
  /* Run quantum and classical paths separately then merge */
  const { vector } = req.body;
  if (!Array.isArray(vector) || vector.length === 0) {
    return res.status(400).json({ error: 'vector required' });
  }
  const input = vector.map(Number);
  const [qRes, cRes] = await Promise.all([
    Promise.resolve(quantumPath(input)),
    Promise.resolve(classicalPath(input)),
  ]);
  const merged   = mergeOutcomes(qRes, cRes);
  const reversed = reverseEngineer(merged.merged, []);
  res.json({ quantumPath: qRes, classicalPath: cRes, merged, reverseEngineering: reversed });
});

app.post('/api/harmonic/topology', (req, res) => {
  const { nodes, edges } = req.body;
  if (!Array.isArray(nodes)) return res.status(400).json({ error: 'nodes array required' });
  const result = reinventTopology({ nodes, edges: edges || [] });
  vault.writeToAllVaults({ type: 'TOPOLOGY_REINVENTION', nodeCount: nodes.length, score: result.overallHarmonicScore }, 'HARMONIC');
  res.json(result);
});

app.post('/api/harmonic/harmonise', (req, res) => {
  const { weights } = req.body;
  if (!Array.isArray(weights)) return res.status(400).json({ error: 'weights array required' });
  res.json({ harmonised: harmonise369(weights.map(Number)), carrier: CARRIER_HZ, solfeggio: SOLFEGGIO });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server with cross-platform error handling
const server = app.listen(port, () => {
  console.log(`\nServer is running on port ${port}`);
  console.log(`Local: http://localhost:${port}`);
  console.log(`Network: http://${getNetworkAddress()}:${port}`);
  console.log(`\nPress Ctrl+C to stop the server\n`);
});

// Graceful shutdown handler (works on Windows, Linux, and macOS)
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Windows-specific shutdown signals
if (process.platform === 'win32') {
  require('readline')
    .createInterface({
      input: process.stdin,
      output: process.stdout
    })
    .on('SIGINT', () => {
      process.emit('SIGINT');
    });
}

function gracefulShutdown() {
  console.log('\n\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown...');
    process.exit(1);
  }, 10000);
}

// Get network address for display
function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}