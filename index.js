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

app.listen(port);