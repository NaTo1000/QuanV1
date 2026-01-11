# QuanV1 - Arkitek Builder Platform

A Node.js web application for managing cluster configurations and generating iPXE boot files for mass server deployment. This project combines a haiku display site with powerful cluster management tools.

## 🚀 Features

- **Intuitive Navigation**: Easy-to-use navigation bar with keyboard shortcuts (Alt+H, Alt+C, Alt+Q, Alt+B)
- **Quick Start Guide**: Step-by-step guidance for new users
- **Cluster Link Management**: Configure and manage multiple cluster endpoints
- **iPXE Boot File Generator**: Generate boot configuration files for mass server deployment
- **Watson X Orchestrator Integration**: AI-powered cluster orchestration with IBM Watson X.ai
- **Quantum Pipeline Training**: Create and train quantum computing pipelines for advanced computational tasks
- **Benchmark Testing**: Run stress tests on cluster endpoints
- **Continuous Testing**: Run tests until failure detection for VMware container benchmarks
- **Multiple Builder Types**: Support for Docker Cloud, Kubernetes, OpenShift, Watson X, Quantum Pipeline, and generic clusters
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Real-time Validation**: Instant form feedback and help text

## 📋 Prerequisites

- Node.js (version 14.0.0 or higher)
- npm (version 6.0.0 or higher)

### Supported Platforms
- ✅ **Windows** (Windows 10, 11, Server 2016+)
- ✅ **macOS** (macOS 10.14+)
- ✅ **Linux** (Ubuntu 18.04+, Debian 9+, CentOS 7+, RHEL 7+, and others)

See [PLATFORM_SUPPORT.md](PLATFORM_SUPPORT.md) for detailed platform-specific instructions.

## 🔧 Installation

### Quick Start (All Platforms)

1. Clone the repository:
```bash
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
```

2. Install dependencies:
```bash
npm install
```

The installation automatically detects your platform and configures appropriately.

### Platform-Specific Notes

**Windows Users:** Use PowerShell or Command Prompt. Both forward slashes (`/`) and backslashes (`\`) work.

**macOS Users:** You may need to install Xcode Command Line Tools:
```bash
xcode-select --install
```

**Linux Users:** Ensure Node.js is installed via your package manager or nvm.

## 🏃 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will be available at:
- Local: `http://localhost:3000`
- Network: `http://<your-ip>:3000` (automatically displayed on startup)

### Using a Different Port

**Windows (PowerShell):**
```powershell
$env:PORT=8080; npm start
```

**Windows (Command Prompt):**
```cmd
set PORT=8080 && npm start
```

**macOS/Linux:**
```bash
PORT=8080 npm start
```

### Using PM2 (Cross-Platform Process Manager)
```bash
npm install -g pm2
pm2 start process.json
pm2 save
pm2 startup  # Follow the instructions to enable startup on boot
```

### Graceful Shutdown
Press `Ctrl+C` on any platform to gracefully shut down the server.

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

### Quantum Pipelines
- `GET /api/quantum/pipelines` - Get all quantum pipelines
- `POST /api/quantum/pipelines` - Create a new quantum pipeline
- `DELETE /api/quantum/pipelines/:id` - Delete a quantum pipeline
- `POST /api/quantum/train` - Start training a quantum pipeline

## 🎯 Usage Examples

### Quick Start
1. Visit the home page to see the Quick Start Guide
2. Follow the 3-step process to get started
3. Use keyboard shortcuts: Alt+H (Home), Alt+C (Clusters), Alt+Q (Quantum), Alt+B (Boot Generator)

### Adding a Cluster Link
Navigate to `/cluster-config` (or press Alt+C) and fill in the form:
- **Link Name**: Production Cluster
- **Builder Type**: Kubernetes, Watson X, Quantum Pipeline, or other supported types
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

## ⚛️ Quantum Pipeline Training

QuanV1 includes comprehensive quantum computing integration for advanced computational tasks:

### Supported Pipeline Types
- **VQE (Variational Quantum Eigensolver)**: Solve eigenvalue problems for quantum chemistry and optimization
- **QAOA (Quantum Approximate Optimization)**: Solve combinatorial optimization problems
- **QNN (Quantum Neural Network)**: Hybrid quantum-classical machine learning models
- **QSVM (Quantum Support Vector Machine)**: Quantum-enhanced classification algorithms
- **Grover's Search**: Quantum search algorithm for unstructured databases
- **Custom Circuit**: Design and run custom quantum circuits

### Features
- **Parameterized Circuits**: Configure qubit count and circuit depth
- **Multiple Backends**: Support for statevector, QASM, Aer, and IBM Quantum simulators
- **Training Dashboard**: Real-time training progress with loss and accuracy metrics
- **Optimization Algorithms**: Adam, SPSA, COBYLA, and Gradient Descent optimizers
- **Training History**: Track all training runs and their results

### Creating a Quantum Pipeline
1. Navigate to `/quantum-training` (or press Alt+Q)
2. Enter a unique pipeline name
3. Select the pipeline type (VQE, QAOA, QNN, etc.)
4. Configure qubits, circuit depth, and backend
5. Click "Create Pipeline"

### Training a Pipeline
1. Create or select an existing pipeline
2. Configure training parameters (epochs, learning rate, optimizer)
3. Click "Train" on the pipeline or "Start Training" button
4. Monitor real-time progress with loss and accuracy metrics
5. Training can be stopped at any time

## 🛡️ Security Notes

- Cluster credentials are stored in `cluster-links.json` (excluded from git)
- Quantum pipeline configurations are stored in `quantum-pipelines.json` (excluded from git)
- Keep your credentials secure and never commit them to version control
- The `.gitignore` file is configured to exclude sensitive files
- All credentials, including Watson X API keys, are stored locally and never transmitted to external services

## 🌐 Cross-Platform Compatibility

QuanV1 is designed to work seamlessly across all major platforms:

- **File Paths**: Uses Node.js `path` module for cross-platform path handling
- **Line Endings**: Automatically handles CRLF (Windows) and LF (Unix/Mac)
- **Process Signals**: Graceful shutdown works on Windows, macOS, and Linux
- **System Info**: View platform details at `/api/system-info`

For detailed platform-specific instructions, see [PLATFORM_SUPPORT.md](PLATFORM_SUPPORT.md)

## 🤝 Contributing

Contributions are welcome! Please ensure changes work across all platforms:
- Use `path.join()` for file paths
- Use `os.EOL` for line endings
- Test on multiple platforms if possible
- See [PLATFORM_SUPPORT.md](PLATFORM_SUPPORT.md) for guidelines

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Resources

- [GitHub Codespaces Quickstart](https://docs.github.com/en/codespaces/getting-started/quickstart)
- [Azure Node.js Sample](https://github.com/Azure-Samples/nodejs-docs-hello-world)
- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
