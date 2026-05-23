# Cross-Platform Support

QuanV1 is designed to work seamlessly across Windows, macOS, and Linux platforms.

## Supported Platforms

✅ **Windows** (Windows 10, Windows 11, Windows Server 2016+)
✅ **macOS** (macOS 10.14+)
✅ **Linux** (Ubuntu 18.04+, Debian 9+, CentOS 7+, RHEL 7+, Fedora, Arch Linux)
✅ **BlackArch Linux** (rolling Arch-based distribution)

## Requirements

- **Node.js**: 14.0.0 or higher
- **npm**: 6.0.0 or higher
- **RAM**: 512MB minimum, 1GB recommended
- **Disk Space**: 100MB for application and dependencies

## Installation

### Windows

```powershell
# Using PowerShell
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
npm install
npm start
```

### macOS

```bash
# Using Terminal
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
npm install
npm start
```

### Linux

```bash
# Using Bash
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
npm install
npm start
```

### BlackArch Linux

```bash
# Using Bash
sudo pacman -Sy --needed nodejs npm
git clone https://github.com/NaTo1000/QuanV1.git
cd QuanV1
npm install
npm start
```

## Platform-Specific Features

### Windows

- Graceful shutdown with Ctrl+C
- Supports Windows path separators (`\`)
- Compatible with PowerShell and Command Prompt
- CRLF line endings automatically handled
- Works with Windows Defender and antivirus software

### macOS

- Native macOS path handling
- Supports macOS security features (Gatekeeper, notarization)
- Compatible with Terminal and iTerm2
- LF line endings (Unix standard)
- Works with macOS firewall

### Linux

- Supports all major Linux distributions
- Compatible with systemd for service management
- Works with SELinux and AppArmor
- LF line endings (Unix standard)
- Process signals handled correctly (SIGTERM, SIGINT)

## System Information Endpoint

Access `/api/system-info` to view platform details:

```bash
curl http://localhost:3000/api/system-info
```

Returns:
- Platform and OS type
- Architecture
- Node.js version
- System uptime
- Memory information
- CPU count
- Network interfaces
- Path separator
- Line ending style

## File Path Handling

The application uses Node.js `path` module for cross-platform file path handling:

```javascript
// ✅ Cross-platform (automatically uses / or \ as needed)
const filePath = path.join(__dirname, 'data', 'file.json');

// ❌ Platform-specific (only works on Unix/Mac)
const filePath = __dirname + '/data/file.json';

// ❌ Platform-specific (only works on Windows)
const filePath = __dirname + '\\data\\file.json';
```

## Line Endings

The application automatically handles line endings:
- **Windows**: CRLF (`\r\n`)
- **Unix/Mac**: LF (`\n`)

Files are written with the appropriate line ending for the current platform.

## Port Configuration

Default port: `3000`

To use a different port:

```bash
# Windows (PowerShell)
$env:PORT=8080; npm start

# Windows (Command Prompt)
set PORT=8080 && npm start

# macOS/Linux
PORT=8080 npm start
```

## Firewall Configuration

### Windows Firewall

1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js or allow port 3000

### macOS Firewall

```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node
```

### Linux (UFW)

```bash
sudo ufw allow 3000
sudo ufw enable
```

### Linux (iptables)

```bash
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

## Running as a Service

### Windows (NSSM)

```powershell
# Install NSSM
choco install nssm

# Install service
nssm install QuanV1 "C:\Program Files\nodejs\node.exe" "C:\path\to\QuanV1\index.js"
nssm start QuanV1
```

### macOS (launchd)

Create `/Library/LaunchDaemons/com.quanv1.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.quanv1</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/QuanV1/index.js</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

```bash
sudo launchctl load /Library/LaunchDaemons/com.quanv1.plist
```

### Linux (systemd)

Create `/etc/systemd/system/quanv1.service`:

```ini
[Unit]
Description=QuanV1 Cluster Management
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/QuanV1
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable quanv1
sudo systemctl start quanv1
```

## Troubleshooting

### Port Already in Use

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
```

**macOS/Linux:**
```bash
lsof -i :3000
kill -9 <pid>
```

### Permission Issues

**Windows:** Run PowerShell or Command Prompt as Administrator

**macOS/Linux:**
```bash
sudo chown -R $USER:$USER .
chmod +x index.js
```

### Module Not Found

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Browser Compatibility

The web interface works on all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Testing Cross-Platform Compatibility

```bash
# Run the application
npm start

# In another terminal, test system info endpoint
curl http://localhost:3000/api/system-info

# Test all pages
curl http://localhost:3000/
curl http://localhost:3000/cluster-config
curl http://localhost:3000/ipxe-boot
```

## Contributing

When contributing, ensure changes work across all platforms:
- Use `path.join()` instead of string concatenation for paths
- Use `os.EOL` for line endings
- Test on Windows, macOS, and Linux if possible
- Avoid platform-specific shell commands
- Use Node.js built-in modules when possible

## Support

For platform-specific issues, please include:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages and logs
- Output of `/api/system-info` endpoint
