# Deployment Guide for QuanV1

This guide provides comprehensive instructions for deploying the QuanV1 application across different environments.

## Table of Contents
- [CI/CD Pipeline Overview](#cicd-pipeline-overview)
- [Environment Configuration](#environment-configuration)
- [Local Development](#local-development)
- [Testing](#testing)
- [Deployment Process](#deployment-process)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Rollback Procedures](#rollback-procedures)

## CI/CD Pipeline Overview

The QuanV1 repository includes automated CI/CD pipelines using GitHub Actions:

### Continuous Integration (CI)
Located in `.github/workflows/ci.yml`, the CI pipeline:
- **Linting**: Checks code quality using ESLint
- **Testing**: Runs unit and integration tests across Node.js versions 16, 18, and 20
- **Building**: Verifies the application builds and starts correctly
- **Security Scanning**: Checks for dependency vulnerabilities

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Continuous Deployment (CD)
Located in `.github/workflows/cd.yml`, the CD pipeline:
- **Development**: Auto-deploys on push to `main`
- **Staging**: Manual deployment via workflow_dispatch
- **Production**: Manual deployment with approval required

## Environment Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key variables:
- `NODE_ENV`: Environment name (development/staging/production)
- `PORT`: Application port
- `CLUSTER_LINKS_FILE`: Path to cluster links configuration

### Port Configuration

- **Development**: Port 3000
- **Staging**: Port 3001
- **Production**: Port 80

## Local Development

### Prerequisites
- Node.js 16+ (18 recommended)
- npm 7+

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NaTo1000/QuanV1.git
   cd QuanV1
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Verify the application:**
   ```bash
   curl http://localhost:3000/health
   ```

### Using Docker

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run staging environment:**
   ```bash
   docker-compose --profile staging up
   ```

3. **Run production environment:**
   ```bash
   docker-compose --profile production up
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Types

1. **Unit Tests**: Test individual functions and API endpoints
2. **Integration Tests**: Test the full application flow
3. **Health Check Tests**: Verify monitoring endpoints

### Continuous Testing

Tests run automatically on:
- Every push to main/develop branches
- Every pull request
- Before deployment to any environment

## Deployment Process

### Development Deployment

**Automatic on every push to main:**
```bash
git push origin main
```

The CI/CD pipeline will:
1. Run linting checks
2. Execute all tests
3. Build the application
4. Deploy to development environment
5. Run health checks

### Staging Deployment

**Manual trigger via GitHub Actions:**
1. Navigate to Actions tab in GitHub
2. Select "CD Pipeline" workflow
3. Click "Run workflow"
4. Select "staging" environment
5. Click "Run workflow"

### Production Deployment

**Manual trigger with approval:**
1. Navigate to Actions tab in GitHub
2. Select "CD Pipeline" workflow
3. Click "Run workflow"
4. Select "production" environment
5. Click "Run workflow"
6. Approval required from designated reviewers
7. After approval, deployment proceeds with:
   - Backup creation
   - Health checks
   - Smoke tests
   - Rollback preparation

## Monitoring and Health Checks

### Health Check Endpoints

**Health Status:**
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T13:58:54.052Z",
  "uptime": 123.456,
  "environment": "production",
  "port": 3000
}
```

**Readiness Check:**
```bash
GET /ready
```

Response:
```json
{
  "ready": true,
  "timestamp": "2025-11-23T13:58:54.052Z"
}
```

### Monitoring Integration

Health checks are integrated with:
- Docker healthcheck (runs every 30 seconds)
- Kubernetes liveness/readiness probes (if applicable)
- CI/CD pipeline verification

## Rollback Procedures

### Automatic Rollback

The pipeline prepares for rollback by:
- Creating backups before production deployment
- Tagging previous versions
- Maintaining deployment history

### Manual Rollback

If issues are detected after deployment:

1. **Identify the previous working version:**
   ```bash
   git log --oneline
   ```

2. **Trigger deployment of previous version:**
   - Go to GitHub Actions
   - Select the workflow run for the previous version
   - Click "Re-run all jobs"

3. **Verify rollback:**
   ```bash
   curl http://production-url/health
   ```

### Emergency Rollback

For critical issues:
1. Stop the current deployment
2. Restore from backup
3. Deploy the last known good version
4. Investigate the issue in a safe environment

## Security

### Vulnerability Scanning

- Automated npm audit runs in CI pipeline
- Security alerts are logged but don't fail the build
- Review security reports regularly

### Secrets Management

- Never commit `.env` files
- Use GitHub Secrets for sensitive data
- Rotate credentials regularly

## Support and Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill
```

**Tests failing:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

**Deployment stuck:**
- Check GitHub Actions logs
- Verify environment variables
- Check health check endpoints

### Getting Help

- Review GitHub Actions logs for detailed error messages
- Check application logs in the deployment environment
- Refer to the main [README.md](README.md) for additional information

## Best Practices

1. **Always test locally** before pushing changes
2. **Run linter** before committing: `npm run lint`
3. **Review test coverage** and aim for >80%
4. **Use feature branches** and pull requests
5. **Write meaningful commit messages**
6. **Monitor deployments** for the first 15 minutes
7. **Keep dependencies updated** but test thoroughly
8. **Document any manual steps** required for deployment

## Continuous Improvement

The CI/CD pipeline is designed to evolve. Suggestions for improvements:
- Add more comprehensive integration tests
- Implement automated performance testing
- Add deployment notifications (Slack, email)
- Integrate with monitoring services (DataDog, New Relic)
- Implement blue-green deployment strategy
