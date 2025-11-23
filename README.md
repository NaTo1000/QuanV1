# QuanV1

A Node.js web application with integrated CI/CD pipelines for seamless deployment and development workflows. This project is based on the [Azure node sample](https://github.com/Azure-Samples/nodejs-docs-hello-world) with enhanced cluster management capabilities.

[![CI Pipeline](https://github.com/NaTo1000/QuanV1/actions/workflows/ci.yml/badge.svg)](https://github.com/NaTo1000/QuanV1/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/NaTo1000/QuanV1/actions/workflows/cd.yml/badge.svg)](https://github.com/NaTo1000/QuanV1/actions/workflows/cd.yml)

## Features

- **Cluster Management**: Add, view, and manage cluster links with credentials
- **Health Monitoring**: Built-in health check and readiness endpoints
- **Automated Testing**: Comprehensive unit and integration tests
- **CI/CD Pipelines**: Automated build, test, and deployment workflows
- **Docker Support**: Containerized deployment with docker-compose
- **Multi-Environment**: Development, staging, and production configurations

## Quick Start

### Prerequisites
- Node.js 16+ (18 recommended)
- npm 7+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1

# Install dependencies
npm install

# Run tests
npm test

# Start the application
npm start
```

The application will be available at `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

## Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint
```

## CI/CD Pipeline

This project includes comprehensive CI/CD pipelines:

### Continuous Integration (CI)
- **Linting**: ESLint code quality checks
- **Testing**: Automated tests across Node.js 16, 18, and 20
- **Building**: Application build verification
- **Security**: Dependency vulnerability scanning

### Continuous Deployment (CD)
- **Development**: Auto-deploy on push to main
- **Staging**: Manual deployment via GitHub Actions
- **Production**: Approval-required deployment with rollback support

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## API Endpoints

### Application Endpoints
- `GET /` - Main haiku display page
- `GET /cluster-config` - Cluster configuration management
- `GET /api/cluster-links` - Get all cluster links
- `POST /api/cluster-links` - Create a new cluster link
- `DELETE /api/cluster-links/:id` - Delete a cluster link

### Monitoring Endpoints
- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check endpoint

## Docker Deployment

```bash
# Build and run with Docker Compose (development)
docker-compose up --build

# Run staging environment
docker-compose --profile staging up

# Run production environment
docker-compose --profile production up
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
NODE_ENV=development
PORT=3000
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed configuration options.

## Project Structure

```
QuanV1/
├── .github/
│   └── workflows/        # CI/CD pipeline definitions
├── public/               # Static assets
├── views/                # EJS templates
├── tests/                # Test files
├── index.js              # Main application file
├── package.json          # Project dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Multi-environment Docker setup
└── DEPLOYMENT.md         # Detailed deployment guide
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All pull requests will automatically trigger the CI pipeline.

## GitHub Codespaces

Point your browser to [Quickstart for GitHub Codespaces](https://docs.github.com/en/codespaces/getting-started/quickstart) for a tour of using Codespaces with this repo.

## License

MIT - See [LICENSE](LICENSE) for details.

## Support

For deployment issues or questions, refer to [DEPLOYMENT.md](DEPLOYMENT.md) or open an issue.
