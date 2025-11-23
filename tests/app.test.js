const request = require('supertest');
const fs = require('fs');
const path = require('path');
const createApp = require('../app');

// Mock the cluster-links.json file
const CLUSTER_LINKS_FILE = path.join(__dirname, '..', 'cluster-links.json');

describe('QuanV1 Application Tests', () => {
  let app;

  beforeAll(() => {
    // Initialize the express app
    app = createApp();
  });

  beforeEach(() => {
    // Clean up cluster links before each test
    if (fs.existsSync(CLUSTER_LINKS_FILE)) {
      fs.unlinkSync(CLUSTER_LINKS_FILE);
    }
  });

  afterAll(() => {
    // Clean up cluster links after all tests
    if (fs.existsSync(CLUSTER_LINKS_FILE)) {
      fs.unlinkSync(CLUSTER_LINKS_FILE);
    }
  });

  describe('GET /', () => {
    it('should return 200 and render the index page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Haikus');
    });
  });

  describe('GET /api/cluster-links', () => {
    it('should return an empty array when no links exist', async () => {
      const response = await request(app).get('/api/cluster-links');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return existing cluster links', async () => {
      // Create a test link
      const testLink = {
        id: '123',
        name: 'test-cluster',
        endpoint: 'http://test.com',
        credentials: 'test-creds',
        builderType: 'generic',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      fs.writeFileSync(CLUSTER_LINKS_FILE, JSON.stringify([testLink], null, 2));

      const response = await request(app).get('/api/cluster-links');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('test-cluster');
    });
  });

  describe('POST /api/cluster-links', () => {
    it('should create a new cluster link', async () => {
      const newLink = {
        name: 'new-cluster',
        endpoint: 'http://new.com',
        credentials: 'new-creds',
        builderType: 'docker'
      };

      const response = await request(app)
        .post('/api/cluster-links')
        .send(newLink);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('new-cluster');
      expect(response.body.endpoint).toBe('http://new.com');
      expect(response.body.builderType).toBe('docker');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 400 when name is missing', async () => {
      const response = await request(app)
        .post('/api/cluster-links')
        .send({ endpoint: 'http://test.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and endpoint are required');
    });

    it('should return 400 when endpoint is missing', async () => {
      const response = await request(app)
        .post('/api/cluster-links')
        .send({ name: 'test' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Name and endpoint are required');
    });

    it('should return 400 when duplicate name exists', async () => {
      const link = {
        name: 'duplicate',
        endpoint: 'http://test.com'
      };

      await request(app).post('/api/cluster-links').send(link);
      const response = await request(app).post('/api/cluster-links').send(link);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('A cluster link with this name already exists');
    });
  });

  describe('DELETE /api/cluster-links/:id', () => {
    it('should delete an existing cluster link', async () => {
      // Create a link first
      const createResponse = await request(app)
        .post('/api/cluster-links')
        .send({ name: 'to-delete', endpoint: 'http://delete.com' });

      const linkId = createResponse.body.id;

      const deleteResponse = await request(app).delete(`/api/cluster-links/${linkId}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Cluster link deleted successfully');

      // Verify it's deleted
      const getResponse = await request(app).get('/api/cluster-links');
      expect(getResponse.body).toHaveLength(0);
    });

    it('should return 404 when trying to delete non-existent link', async () => {
      const response = await request(app).delete('/api/cluster-links/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Cluster link not found');
    });
  });

  describe('GET /cluster-config', () => {
    it('should return 200 and render the cluster config page', async () => {
      const response = await request(app).get('/cluster-config');
      expect(response.status).toBe(200);
      expect(response.text).toContain('cluster');
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('port');
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app).get('/ready');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ready', true);
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
