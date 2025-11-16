let express = require('express');
let app = express();
let ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const haikus = require('./haikus.json');
const port = process.env.PORT || 3000;

app.use(express.static('public'))
app.use(express.json());
app.set('view engine', 'ejs');

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

// Helper function to write cluster links
function writeClusterLinks(links) {
  fs.writeFileSync(CLUSTER_LINKS_FILE, JSON.stringify(links, null, 2));
}

app.get('/', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('index', {haikus: haikus, clusterLinks: clusterLinks});
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

// Cluster link configuration page
app.get('/cluster-config', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('cluster-config', { clusterLinks: clusterLinks });
});

// iPXE boot file generation page
app.get('/ipxe-boot', (req, res) => {
  const clusterLinks = readClusterLinks();
  res.render('ipxe-boot', { clusterLinks: clusterLinks });
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

app.listen(port);