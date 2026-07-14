# Docker Deployment Guide

## ⚠️ Build Note
The Docker build has been tested and works correctly when built locally. There may be npm installation issues in some CI/CD environments. If you encounter module loading issues, try:
- Building with `docker build --no-cache`
- Using `node:20` base image instead of `node:20-slim`
- Ensuring stable network connection during build

## Quick Start

### Pull from Docker Hub
```bash
docker pull nato1000/quanv1:latest
docker run -d -p 3000:3000 --name quanv1 nato1000/quanv1:latest
```

### Build Locally
```bash
docker build -t nato1000/quanv1:latest .
docker run -d -p 3000:3000 --name quanv1 nato1000/quanv1:latest
```

### Using Docker Compose
```bash
docker-compose up -d
```

## Access the Application
- **Local**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/system-info

## Docker Image Features

### Optimizations
- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Minimal base image (~5MB base)
- **Non-root user**: Enhanced security
- **Health checks**: Automatic container health monitoring
- **Multi-platform**: Supports AMD64 and ARM64

### Security
- Runs as non-root user (nodejs:1001)
- Minimal attack surface with Alpine
- No dev dependencies in production image
- Secrets excluded via .dockerignore

## Environment Variables

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  --name quanv1 \
  nato1000/quanv1:latest
```

## Persistent Data

To persist cluster links data:

```bash
docker run -d \
  -p 3000:3000 \
  -v quanv1-data:/app/data \
  --name quanv1 \
  nato1000/quanv1:latest
```

## Docker Compose Configuration

The included `docker-compose.yml` provides a **clustered deployment** with:
- **3 app instances** for high availability and load distribution
- **Nginx load balancer** for traffic distribution across instances
- Automatic restart policy
- Health checks on all services
- Shared volume for data persistence
- Network isolation

### Cluster Architecture
```
                    ┌─────────────────┐
                    │   Client/User   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Nginx (Port 80)│
                    │  Load Balancer  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │  App Node 1 │    │  App Node 2 │    │  App Node 3 │
   │  (Port 3000)│    │  (Port 3000)│    │  (Port 3000)│
   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Shared Volume  │
                    │  (cluster-data) │
                    └─────────────────┘
```

### Commands
```bash
# Start the cluster
docker-compose up -d

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f quanv1-app-1

# Stop the cluster
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Scale specific services (if needed)
docker-compose up -d --scale quanv1-app-1=1 --scale quanv1-app-2=1 --scale quanv1-app-3=1
```

### Access Points
- **Application**: http://localhost (through load balancer)
- **Health Check**: http://localhost/health
- **System Info**: http://localhost/api/system-info

## CI/CD Integration

GitHub Actions workflow automatically builds and pushes to Docker Hub:
- **On push to main**: Builds and pushes with `latest` tag
- **On version tags**: Builds with semantic version tags
- **Multi-platform**: AMD64 and ARM64 support

### Required Secrets
Set these in GitHub repository secrets:
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token

## Manual Push to Docker Hub

```bash
# Login
docker login

# Tag image
docker tag nato1000/quanv1:latest nato1000/quanv1:v0.0.1

# Push
docker push nato1000/quanv1:latest
docker push nato1000/quanv1:v0.0.1
```

## Dockerfile Details

### Build Arguments
None currently, but can be extended for build-time customization.

### Image Layers
1. **Builder stage**: Installs production dependencies
2. **Production stage**: Copies app and dependencies
3. **User setup**: Creates non-root user
4. **Health check**: Monitors application health

### Size Optimization
- Multi-stage build removes build artifacts
- Alpine Linux minimal base
- Production-only dependencies
- .dockerignore excludes unnecessary files

Expected image size: ~150-200MB

## Troubleshooting

### Container won't start
```bash
docker logs quanv1
```

### Port already in use
```bash
docker run -d -p 8080:3000 --name quanv1 nato1000/quanv1:latest
```

### Permission issues
The container runs as user `nodejs` (UID 1001). Ensure mounted volumes have correct permissions:
```bash
chown -R 1001:1001 /path/to/data
```

## Health Monitoring

The container includes health checks that run every 30 seconds:
```bash
docker inspect --format='{{json .State.Health}}' quanv1
```

## Kubernetes Deployment

Example deployment:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quanv1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: quanv1
  template:
    metadata:
      labels:
        app: quanv1
    spec:
      containers:
      - name: quanv1
        image: nato1000/quanv1:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        livenessProbe:
          httpGet:
            path: /api/system-info
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: quanv1-service
spec:
  selector:
    app: quanv1
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Performance Tips

1. **Resource Limits**:
```bash
docker run -d \
  --memory="512m" \
  --cpus="1.0" \
  -p 3000:3000 \
  nato1000/quanv1:latest
```

2. **Logging**:
```bash
docker run -d \
  --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  -p 3000:3000 \
  nato1000/quanv1:latest
```

3. **Network Mode**:
```bash
docker run -d \
  --network=host \
  nato1000/quanv1:latest
```
