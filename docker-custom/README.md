# CySOAR v1.0.0 - Implementation Documentation

**CySOAR** (Cycentra Security Orchestration, Automation and Response)  
**Based on:** Node-RED 4.1.7  
**Release Date:** March 10, 2026  
**Status:** Production Ready ✅

---

## Table of Contents
1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Whitelabeling Changes](#whitelabeling-changes)
4. [Build Instructions](#build-instructions)
5. [Deployment](#deployment)
6. [Verification](#verification)
7. [Architecture](#architecture)
8. [Maintenance](#maintenance)

---

## Overview

CySOAR is a fully whitelabeled version of Node-RED 4.1.7, customized for Cycentra360's security orchestration and automation platform. This implementation provides a seamless, professional branding experience with zero client-side delays or visual artifacts.

### Key Improvements Over Base Node-RED
- ✅ Complete visual rebranding (logos, colors, text)
- ✅ Source-level text replacements (instant, no JavaScript delays)
- ✅ Removed all Node-RED references and version history
- ✅ Custom "About" content with CySOAR branding
- ✅ Eliminated guided tours and change logs
- ✅ Professional green color scheme (#28a745)
- ✅ Version displayed as 1.0.0 instead of 4.1.7

---

## Key Features

### 1. Visual Branding
- **Header Logo:** Custom CySOAR/Cycentra logo
- **Favicon:** Custom icon with company branding
- **Icon Set:** Simplified "CY" monogram for all icon variants
- **Color Scheme:** Professional green (#28a745) replaces red (#8f0000)

### 2. Text Branding
- All instances of "Node-RED" replaced with "CySOAR"
- Palette shows "CyCentra" instead of "node-red"
- Page title: "CySOAR - Security Orchestration & Automation"
- Version: "1.0.0" (hidden from end users)

### 3. Content Customization
- **About Section:** Custom CySOAR 1.0.0 content with features and getting started guide
- **Tours Removed:** All guided tours and "Take a tour" content eliminated
- **Change Log Removed:** Complete Node-RED version history removed

### 4. Performance Optimization
- **Zero Flash:** Preload script hides content before render
- **Instant Branding:** Source-level text replacements (no JavaScript delays)
- **Aggressive Hiding:** Display:none prevents any visual artifacts during load

---

## Whitelabeling Changes

### File Structure
```
docker-custom/
├── Dockerfile.custom          # Main build file with all modifications
├── settings.js                # Node-RED configuration
├── docker-alpine.sh           # Build script
├── branding/
│   ├── logo.svg               # Header logo (Cycentra)
│   ├── logo.png               # About page logo
│   ├── icon-simple.svg        # Simplified CY monogram icon
│   ├── favicon.ico            # Browser favicon
│   ├── custom.css             # Green color overrides
│   ├── cysoar-preload.js      # Pre-render hiding script
│   ├── cysoar-init.js         # Post-load cleanup script
│   └── about                  # Custom CySOAR about content
```

### Dockerfile.custom Modifications

#### 1. Asset Replacement
```dockerfile
# Copy logos and icons
COPY branding/logo.svg /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images/node-red.svg
COPY branding/icon-simple.svg /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images/node-red-icon.svg
COPY branding/icon-simple.svg /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images/node-red-icon-black.svg
COPY branding/icon-simple.svg /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images/node-red-256.svg
COPY branding/favicon.ico /usr/src/node-red/node_modules/@node-red/editor-client/public/favicon.ico
COPY branding/logo.png /usr/src/node-red/node_modules/@node-red/editor-client/public/red/images/node-red-256.png
```

#### 2. Custom Scripts & Styles
```dockerfile
# Copy custom CSS and JS
COPY branding/custom.css /usr/src/node-red/node_modules/@node-red/editor-client/public/red/custom.css
COPY branding/cysoar-preload.js /usr/src/node-red/node_modules/@node-red/editor-client/public/red/cysoar-preload.js
COPY branding/cysoar-init.js /usr/src/node-red/node_modules/@node-red/editor-client/public/red/cysoar-init.js
```

#### 3. Content Removal
```dockerfile
# Replace about file (removes entire Change Log)
COPY branding/about /usr/src/node-red/node_modules/@node-red/editor-client/public/red/about

# Remove all tour files
RUN rm -rf /usr/src/node-red/node_modules/@node-red/editor-client/public/red/tours/*

# Change version from 4.1.7 to 1.0.0
RUN sed -i 's/"version": "4.1.7"/"version": "1.0.0"/g' /usr/src/node-red/node_modules/node-red/package.json && \
    sed -i 's/"version": "4.1.7"/"version": "1.0.0"/g' /usr/src/node-red/node_modules/@node-red/editor-client/package.json
```

#### 4. Template Injection
```dockerfile
# Fix quote bug in template
RUN sed -i 's|style.min.css?v={{ cacheBuster }}>|style.min.css?v={{ cacheBuster }}">|g' /usr/src/node-red/node_modules/@node-red/editor-client/templates/index.mst

# Inject preload script in HEAD (runs before body)
RUN sed -i '/<\/head>/i\    <script src="red/cysoar-preload.js?v={{ cacheBuster }}"></script>' /usr/src/node-red/node_modules/@node-red/editor-client/templates/index.mst

# Inject CSS and main JS in BODY
RUN sed -i '/<link rel="stylesheet" href="red\/style.min.css/a\    <link rel="stylesheet" href="red/custom.css?v={{ cacheBuster }}">' /usr/src/node-red/node_modules/@node-red/editor-client/templates/index.mst && \
    sed -i '/<script src="{{{ asset.main }}}/a\    <script src="red/cysoar-init.js?v={{ cacheBuster }}"></script>' /usr/src/node-red/node_modules/@node-red/editor-client/templates/index.mst
```

#### 5. Locale Modifications
```dockerfile
# Replace Node-RED with CySOAR in source locale files
RUN sed -i 's/Node-RED/CySOAR/g' /usr/src/node-red/node_modules/@node-red/editor-client/locales/en-US/editor.json && \
    sed -i 's/node-red/cycentra soar/g' /usr/src/node-red/node_modules/@node-red/editor-client/locales/en-US/editor.json && \
    sed -i 's/Show guided tours for new versions//g' /usr/src/node-red/node_modules/@node-red/editor-client/locales/en-US/editor.json
```

### Settings.js Configuration
```javascript
module.exports = {
    uiPort: process.env.PORT || 1880,
    userDir: '/data',
    flowFile: 'flows.json',
    
    editorTheme: {
        page: {
            title: "CySOAR - Security Orchestration & Automation"
        },
        header: {
            title: "CySOAR"
        }
    }
}
```

### Custom Scripts

#### cysoar-preload.js (Runs in HEAD before page renders)
- Creates style element with `display: none !important` on all help content
- Sets up MutationObserver to catch and hide elements as they're added
- Prevents any flash of old content (Node-RED, Change Log, version numbers)

#### cysoar-init.js (Runs after Node-RED loads)
- `replacePaletteText()`: Changes "node-red" → "CyCentra" in palette
- `replaceMenuHeaders()`: Changes "Node-RED" → "CySOAR" in menus
- `removeHelpSection()`: Removes Change Log and version number tree branches
- `replaceAboutText()`: Updates about section text
- `runAllReplacements()`: Removes preload hiding, unhides cleaned content

### Custom CSS (custom.css)
```css
/* Green deploy button */
#red-ui-header-button-deploy {
    background: #28a745 !important;
    border-color: #28a745 !important;
}

#red-ui-header-button-deploy:hover {
    background: #218838 !important;
}

/* All primary buttons green */
.red-ui-button.primary {
    background: #28a745 !important;
    border-color: #28a745 !important;
}
```

---

## Build Instructions

### Prerequisites
- Docker Desktop installed
- 2GB+ free disk space
- Internet connection for base image download

### Building the Image

1. **Navigate to docker-custom directory:**
   ```bash
   cd /path/to/CySOAR/docker-custom
   ```

2. **Run the build script:**
   ```bash
   ./docker-alpine.sh
   ```

3. **Build takes approximately 100-120 seconds:**
   ```
   [+] Building 102.2s (38/38) FINISHED
   => exporting to image cysoar:latest
   ```

4. **Verify image was created:**
   ```bash
   docker images | grep cysoar
   ```
   Expected output:
   ```
   cysoar    latest    96bb4fc4f56b    2 minutes ago    574MB
   ```

### Build Process Overview
1. **BASE stage:** Install dependencies, devtools, configure SSH
2. **BUILD stage:** npm install with production dependencies
3. **RELEASE stage:** Copy artifacts, apply branding, inject scripts, modify locales

---

## Deployment

### Quick Start

**Run the container:**
```bash
docker run -d \
  -p 1880:1880 \
  -v cysoar_data:/data \
  --name cysoar \
  cysoar:latest
```

**Access the interface:**
- Open browser: http://localhost:1880
- Default credentials: (configure in settings.js)

### Production Deployment

**With custom port and network:**
```bash
docker run -d \
  -p 8080:1880 \
  -v /path/to/data:/data \
  --network cycentra_network \
  --restart unless-stopped \
  --name cysoar \
  cysoar:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  cysoar:
    image: cysoar:latest
    container_name: cysoar
    ports:
      - "1880:1880"
    volumes:
      - cysoar_data:/data
    restart: unless-stopped
    environment:
      - TZ=America/New_York
      - NODE_OPTIONS=--max-old-space-size=2048

volumes:
  cysoar_data:
    driver: local
```

---

## Verification

### Post-Deployment Checklist

#### 1. Visual Verification
- [ ] Header shows "CySOAR" logo (not Node-RED)
- [ ] Favicon shows custom Cycentra icon
- [ ] Deploy button is GREEN (#28a745)
- [ ] No red colors in primary UI elements

#### 2. Text Verification
```bash
# Check for any remaining "Node-RED" text
curl -s http://localhost:1880 | grep -i "node-red"
# Expected: No output (or only in comments)

# Verify CySOAR branding
curl -s http://localhost:1880 | grep -i "cysoar"
# Expected: Multiple matches
```

#### 3. Content Verification
- [ ] Open hamburger menu → Help
  - [ ] No "Change Log" section visible
  - [ ] No version numbers (4.1, 4.0, 3.1, etc.)
  - [ ] No "Guided Tours" or "Take a tour"
  - [ ] All headers show "CySOAR" not "Node-RED"

#### 4. About Section
```bash
# Check about content
curl -s http://localhost:1880/red/about | head -5
```
Expected output:
```markdown
#### CySOAR 1.0.0: Security Orchestration & Automation Response

**CySOAR** (Cycentra Security Orchestration, Automation and Response)
```

#### 5. Version Check
```bash
# Verify version changed to 1.0.0
docker exec cysoar grep '"version"' /usr/src/node-red/node_modules/node-red/package.json
```
Expected: `"version": "1.0.0",`

#### 6. Script Load Order
```bash
# Verify both scripts are loaded
curl -s http://localhost:1880 | grep -n "script src" | grep -E "(preload|cysoar)"
```
Expected output:
```
32:    <script src="red/cysoar-preload.js?v=..."></script>
40:    <script src="red/cysoar-init.js?v=..."></script>
```

#### 7. Performance Check
- [ ] Open browser (hard refresh: Cmd+Shift+R / Ctrl+F5)
- [ ] No visible flash of "Node-RED" content
- [ ] Help menu loads cleanly without flickering
- [ ] All content appears branded from first render

---

## Architecture

### Script Loading Sequence
```
1. HTML HEAD loads
2. cysoar-preload.js executes (IMMEDIATE)
   - Creates style element with display:none
   - Hides all help content aggressively
   - Sets up MutationObserver
3. Vendor scripts load (vendor.js, monaco)
4. Node-RED core loads (red.min.js)
5. cysoar-init.js executes (CLEANUP)
   - Removes unwanted DOM elements
   - Replaces remaining text
   - Removes preload hiding styles
   - Unhides cleaned content
6. User sees fully branded interface
```

### Branding Strategy Summary

| Aspect | Method | Timing |
|--------|--------|--------|
| Logos & Icons | File replacement | Build time |
| Colors (CSS) | Style injection | Page load |
| Static Text | Locale file modification | Build time (instant) |
| Dynamic Text | JavaScript replacement | Post-load (100ms-1s) |
| Help Content | Source file replacement | Build time |
| Tours | Directory deletion | Build time |
| Version | package.json modification | Build time |
| Flash Prevention | Preload script | Pre-render |

---

## Maintenance

### Updating Branding Assets

1. **Replace logo/icons:**
   ```bash
   cp new-logo.svg docker-custom/branding/logo.svg
   ./docker-alpine.sh
   ```

2. **Change color scheme:**
   Edit `docker-custom/branding/custom.css`, rebuild image

3. **Update about content:**
   Edit `docker-custom/branding/about`, rebuild image

### Upgrading Node-RED Base Version

⚠️ **Important:** Test thoroughly when upgrading Node-RED base version

1. Update `Dockerfile.custom` line 8:
   ```dockerfile
   ARG NODE_RED_VERSION=4.x.x  # Change version here
   ```

2. Update version replacement commands (lines ~98-100):
   ```dockerfile
   RUN sed -i 's/"version": "4.x.x"/"version": "1.0.0"/g' ...
   ```

3. Rebuild and test all branding changes

### Troubleshooting

**Issue: Flash of old content visible**
- Solution: Increase hiding scope in `cysoar-preload.js`
- Add more selectors to `hideStyle.textContent`

**Issue: "Node-RED" text still appears**
- Check locale files weren't reverted
- Run: `docker exec cysoar grep -i "node-red" /usr/src/node-red/node_modules/@node-red/editor-client/locales/en-US/editor.json`

**Issue: Deploy button still red**
- Verify `custom.css` was copied correctly
- Check browser cache (hard refresh)

**Issue: Help menu shows Change Log**
- Verify `about` file was replaced
- Check tours directory is empty

---

## Technical Specifications

### Image Details
- **Base Image:** node:20-alpine
- **Node.js Version:** 20.x LTS
- **Node-RED Version:** 4.1.7 (displayed as 1.0.0)
- **Image Size:** ~574 MB
- **Build Time:** ~100-120 seconds

### Port Configuration
- **Web Interface:** 1880
- **API Endpoint:** 1880 (same port)

### Volume Mounts
- **/data:** Persistent storage for flows, credentials, settings

### Environment Variables
- `NODE_RED_VERSION`: Set in Dockerfile
- `NODE_PATH`: Configured for module resolution
- `FLOWS`: flows.json

---

## Security Considerations

1. **Credentials:** Configure authentication in `settings.js`
2. **HTTPS:** Use reverse proxy (nginx/traefik) for SSL
3. **Network:** Deploy in isolated Docker network
4. **Updates:** Monitor Node-RED security advisories
5. **Volumes:** Secure /data volume with appropriate permissions

---

## Support & Contact

For issues, questions, or improvements:
- **Internal Team:** Contact Cycentra360 DevOps
- **Documentation:** This file + README.md
- **Logs:** `docker logs cysoar`

---

## Version History

### v1.0.0 (March 10, 2026) - Initial Release
- Complete whitelabeling of Node-RED 4.1.7
- Custom CySOAR branding with green color scheme
- Source-level text replacements (instant loading)
- Removed Change Log, tours, and Node-RED references
- Zero-flash preload script implementation
- Production-ready Docker image

---

## License

Based on Node-RED (Apache 2.0 License)  
Customizations © 2026 Cycentra360  

---

## Integration with SIEM/SOAR Systems

### Wazuh Integration

**Architecture:** Wazuh Manager →(REST API)→ CySOAR Workflows →(HTTP API)→ Response Actions

#### Setup Steps

1. **Install Wazuh node in CySOAR:**
```bash
docker exec cysoar sh -c "cd /data && npm install node-red-contrib-wazuh"
docker restart cysoar
```

2. **Configure Wazuh webhook** (in ossec.conf):
```xml
<integration>
  <name>custom-webhook</name>
  <hook_url>http://cysoar-host:1880/wazuh/alerts</hook_url>
  <level>7</level>
  <alert_format>json</alert_format>
</integration>
```

3. **Create alert processing flow:**
```
[HTTP In: /wazuh/alerts] → [Parse Alert] → [Switch by Severity]
    ├─ Critical → [Create IRIS Case] → [Slack Alert]
    ├─ High → [Email Security Team]
    └─ Medium → [Log to Database]
```

#### Example Integration Flows

- **Auto-Block Malicious IPs:** `[Wazuh Alert] → [Extract IP] → [Threat Intel Check] → [Block Firewall]`
- **FIM Response:** `[Wazuh FIM Alert] → [Parse Changed File] → [Check Baseline] → [Restore/Alert]`
- **Vulnerability Patching:** `[Wazuh Vulnerability] → [Extract CVE] → [Query NIST] → [Create Patch Ticket]`

### DFIR-IRIS Integration

**Architecture:** CySOAR Detection →(REST API)→ DFIR-IRIS Cases →(S3/NFS API)→ Evidence Storage

#### Setup Steps

1. **Get IRIS API key:** Login to IRIS → User Settings → API Keys → Generate new key

2. **Store credentials in CySOAR:**
```javascript
{
    "iris_url": "https://iris.company.com",
    "iris_api_key": "your-iris-api-key",
    "iris_org_id": "1"
}
```

3. **Create case automation flow:**
```
[Security Alert] → [Function: Format] → [HTTP: POST /api/v1/cases] → [Log Case ID]

// Function node:
msg.payload = {
    case_name: msg.payload.alert_name,
    case_description: msg.payload.description,
    case_customer: 1,
    case_classification: msg.payload.severity
};
```

#### Example IRIS Flows

- ** Auto-Create Cases:** `[Alert] → [Format Data] → [HTTP: Create IRIS Case] → [Log Response]`
- **Sync Evidence:** `[File Upload] → [Parse Evidence] → [HTTP: IRIS Add Evidence] → [Update Case]`
- **Timeline Correlation:** `[Multiple Sources] → [Normalize Timestamps] → [HTTP: IRIS Add Timeline]`

#### IRIS API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/cases` | POST | Create case |
| `/api/v1/cases/{id}` | GET | Get case details |
| `/api/v1/cases/{id}/evidences` | POST | Add evidence |
| `/api/v1/cases/{id}/timeline` | POST | Add timeline entry |
| `/api/v1/cases/{id}/notes` | POST | Add notes |

---

## Upgrade Guide

### Minor/Patch Upgrades (1.0.x → 1.1.x) - Safe

```bash
# 1. Backup data
docker run --rm -v cysoar_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/cysoar-backup-$(date +%Y%m%d).tar.gz -C /data .

# 2. Stop and remove old container
docker stop cysoar && docker rm cysoar

# 3. Pull or build new version
git pull origin main && ./docker-alpine.sh

# 4. Start new version with same volume
docker run -d -p 1880:1880 -v cysoar_data:/data \
  -e SMTP_HOST=smtp.gmail.com -e SMTP_PORT=587 \
  -e SMTP_USER=your@email.com -e SMTP_PASS=your-app-password \
  --name cysoar cysoar:latest

# 5. Verify
docker logs cysoar
```

### Major Upgrades (1.x → 2.x) - Test First

```bash
# 1. Create test environment
docker volume create cysoar_test
docker run --rm -v cysoar_data:/source:ro -v cysoar_test:/dest \
  alpine sh -c "cp -a /source/. /dest/"

# 2. Test new version
docker run -d -p 1881:1880 -v cysoar_test:/data --name cysoar-test cysoar:2.0.0

# 3. Verify @ http://localhost:1881

# 4. If successful, upgrade production
docker stop cysoar && docker rm cysoar
docker run -d -p 1880:1880 -v cysoar_data:/data ---name cysoar cysoar:2.0.0
```

### Rollback Procedure

```bash
docker stop cysoar && docker rm cysoar
docker run -d -p 1880:1880 -v cysoar_data:/data --name cysoar cysoar:1.0.0

# Restore backup if needed
docker run --rm -v cysoar_data:/data -v $(pwd):/backup \
  alpine sh -c "cd /data && tar xzf /backup/cysoar-backup-YYYYMMDD.tar.gz"
```

---

## Troubleshooting Guide

### Container Issues

**Container Won't Start:**
```bash
docker logs cysoar  # Check for errors
lsof -i :1880  # Port already in use?
docker volume rm cysoar_data && docker volume create cysoar_data  # Volume issues?
```

**Container Running but UI Not Accessible:**
```bash
docker ps | grep cysoar  # Verify running
docker port cysoar  # Check port mapping
docker exec cysoar netstat -tlnp | grep 1880  # Service listening?
```

### Support System Issues

**Support Form Returns 404:**
```bash
docker logs cysoar | grep -i support
# Expected: "CySOAR Support System initialized" and "✅ initialized successfully"

docker exec cysoar ls /usr/src/node-red/node_modules/cysoar-support-system/
# Rebuild if files missing: docker stop cysoar && docker rm cysoar && ./docker-alpine.sh
```

**Email Not Sending:**
```bash
docker logs cysoar 2>&1 | grep -i "mail\|smtp"

# Common issues:
# 1. Gmail App Password has spaces → Remove ALL spaces
# 2. Wrong credentials → Verify with: docker inspect cysoar | grep SMTP
# 3. Connection blocked → Test: docker exec cysoar nc -zv smtp.gmail.com 587
# 4. Restart with correct credentials
```

### Branding Issues

**Node-RED Branding Still Visible:**
```bash
curl http://localhost:1880 | grep "cysoar-init.js"  # Scripts loaded?
# Hard refresh browser: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Rebuild if needed: docker rmi cysoar:latest && ./docker-alpine.sh
```

### Integration Issues

**Wazuh Connection Failed:**
```bash
docker exec cysoar nslookup wazuh-manager  # DNS resolution?
# Add CySOAR to Wazuh whitelist in ossec.conf:
# <api><allowed_ips>cysoar-ip-address</allowed_ips></api>
```

**IRIS API Authentication Failed:**
```bash
curl -H "Authorization: Bearer YOUR_KEY" https://iris.company.com/api/v1/cases
# Verify API key permissions in IRIS → User Settings → API Keys
```

---

## Quick Reference Card

### Common Commands
```bash
# Start/Stop/Restart
docker start cysoar
docker stop cysoar
docker restart cysoar

# View Logs
docker logs cysoar
docker logs -f cysoar  # Follow mode

# Backup Data
docker run --rm -v cysoar_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Access Container Shell
docker exec -it cysoar /bin/sh

# Rebuild from Scratch
docker stop cysoar && docker rm cysoar && docker rmi cysoar:latest
./docker-alpine.sh
```

### Access Points
- **CySOAR Editor:** http://localhost:1880
- **Support Form:** http://localhost:1880/cysoar/support

### File Structure
```
docker-custom/
├── Dockerfile.custom          # Main build config
├── docker-alpine.sh           # Build script (574MB)
├── settings.js                # Node-RED config + SMTP
├── package.json               # Dependencies
├── .env.example               # SMTP templates
├── branding/                  # Visual assets
│   ├── support-form.html      # Support form UI
│   ├── support-handler.js     # Backend API
│   ├── cysoar-init.js         # Menu integration
│   └── ...
└── README.md                  # This file
```

---

## Support & Contributing

### Getting Help
1. Check logs: `docker logs cysoar`
2. Use support form: http://localhost:1880/cysoar/support
3. Review this README
4. Email: support@cycentra.com

### Reporting Issues
Submit via support form or email with:
- CySOAR version
- Docker version
- Host OS
- Steps to reproduce
- Relevant logs

---

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Maintained By:** Cycentra360 DevOps Team
