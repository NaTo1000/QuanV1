# QuanV1 - Arkitek Builder Platform

A Node.js web application for managing cluster configurations and generating iPXE boot files for mass server deployment. This project combines a haiku display site with powerful cluster management tools.

## 🚀 Features

- **Intuitive Navigation**: Easy-to-use navigation bar with keyboard shortcuts (Alt+H, Alt+C, Alt+B)
- **Quick Start Guide**: Step-by-step guidance for new users
- **Cluster Link Management**: Configure and manage multiple cluster endpoints
- **iPXE Boot File Generator**: Generate boot configuration files for mass server deployment
- **Watson X Orchestrator Integration**: AI-powered cluster orchestration with IBM Watson X.ai
- **Benchmark Testing**: Run stress tests on cluster endpoints
- **Continuous Testing**: Run tests until failure detection for VMware container benchmarks
- **Multiple Builder Types**: Support for Docker Cloud, Kubernetes, OpenShift, Watson X, and generic clusters
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Real-time Validation**: Instant form feedback and help text

## 📋 Prerequisites

- Node.js (version 14 or higher recommended)
- npm (Node Package Manager)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
```

2. Install dependencies:
```bash
npm install
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Using PM2
```bash
pm2 start process.json
```

## 📁 Project Structure

```
QuanV1/
├── index.js              # Main application server
├── package.json          # Project dependencies
├── process.json          # PM2 configuration
├── haikus.json          # Haiku data
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── images/         # Image files
├── views/              # EJS templates
│   ├── index.ejs       # Home page
│   ├── cluster-config.ejs  # Cluster configuration page
│   └── ipxe-boot.ejs   # iPXE boot generator page
└── web.config          # IIS/iisnode configuration
```

## 🔗 API Endpoints

### Cluster Links
- `GET /api/cluster-links` - Get all cluster links
- `POST /api/cluster-links` - Create a new cluster link
- `DELETE /api/cluster-links/:id` - Delete a cluster link

### iPXE Boot
- `POST /api/ipxe/generate` - Generate iPXE boot configuration file

### Testing
- `POST /api/benchmark/run` - Run benchmark/stress test
- `POST /api/test/run-until-fail` - Run continuous test until failure

## 🎯 Usage Examples

### Quick Start
1. Visit the home page to see the Quick Start Guide
2. Follow the 3-step process to get started
3. Use keyboard shortcuts: Alt+H (Home), Alt+C (Clusters), Alt+B (Boot Generator)

### Adding a Cluster Link
Navigate to `/cluster-config` (or press Alt+C) and fill in the form:
- **Link Name**: Production Cluster
- **Builder Type**: Kubernetes (or Watson X Orchestrator for AI-powered management)
- **Endpoint URL**: https://cluster.example.com:9092
- **Credentials**: Your API key or token (optional)

### Integrating Watson X Orchestrator
1. Navigate to Cluster Configuration
2. Select "Watson X Orchestrator" as the builder type
3. Enter your Watson X endpoint URL
4. Add your Watson X API credentials
5. The platform will automatically leverage AI for intelligent cluster management

### Generating iPXE Boot Files
1. Navigate to `/ipxe-boot`
2. Enter cluster name and number of servers
3. Optionally customize boot image URL and kernel parameters
4. Click "Generate & Download iPXE File"

## 🤖 Watson X Orchestrator

QuanV1 now supports IBM Watson X.ai integration for intelligent cluster orchestration:

### Features
- **AI-Powered Orchestration**: Automated resource allocation and predictive scaling
- **Real-time Analytics**: Performance monitoring with AI-driven insights
- **Cost Optimization**: Intelligent suggestions for resource optimization
- **Anomaly Detection**: Automatic detection and alerting of cluster issues

### Setup
1. Add a Watson X cluster in the Clusters section
2. Configure your Watson X endpoint and API credentials
3. The platform automatically leverages Watson X capabilities for all operations

## 🛡️ Security Notes

- Cluster credentials are stored in `cluster-links.json` (excluded from git)
- Keep your credentials secure and never commit them to version control
- The `.gitignore` file is configured to exclude sensitive files
- All credentials, including Watson X API keys, are stored locally and never transmitted to external services

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Resources

- [GitHub Codespaces Quickstart](https://docs.github.com/en/codespaces/getting-started/quickstart)
- [Azure Node.js Sample](https://github.com/Azure-Samples/nodejs-docs-hello-world)
- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
