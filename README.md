# QuanV1 - Arkitek Builder Platform

A Node.js web application for managing cluster configurations and generating iPXE boot files for mass server deployment. This project combines a haiku display site with powerful cluster management tools.

## 🚀 Features

- **Haiku Display**: Beautiful presentation of haiku poetry with accompanying images
- **Cluster Link Management**: Configure and manage multiple cluster endpoints
- **iPXE Boot File Generator**: Generate boot configuration files for mass server deployment
- **Benchmark Testing**: Run stress tests on cluster endpoints
- **Continuous Testing**: Run tests until failure detection for VMware container benchmarks
- **Multiple Builder Types**: Support for Docker Cloud, Kubernetes, OpenShift, and generic clusters

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

### Adding a Cluster Link
Navigate to `/cluster-config` and fill in the form:
- **Link Name**: Production Cluster
- **Builder Type**: Kubernetes
- **Endpoint URL**: https://cluster.example.com:9092
- **Credentials**: Your API key or token (optional)

### Generating iPXE Boot Files
1. Navigate to `/ipxe-boot`
2. Enter cluster name and number of servers
3. Optionally customize boot image URL and kernel parameters
4. Click "Generate & Download iPXE File"

## 🛡️ Security Notes

- Cluster credentials are stored in `cluster-links.json` (excluded from git)
- Keep your credentials secure and never commit them to version control
- The `.gitignore` file is configured to exclude sensitive files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🔗 Related Resources

- [GitHub Codespaces Quickstart](https://docs.github.com/en/codespaces/getting-started/quickstart)
- [Azure Node.js Sample](https://github.com/Azure-Samples/nodejs-docs-hello-world)
- [Express.js Documentation](https://expressjs.com/)
- [EJS Documentation](https://ejs.co/)
