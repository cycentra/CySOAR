# CySOAR Whitelabeling Summary

This document summarizes the whitelabeling changes applied to transform Node-RED Docker into CySOAR.

## Date: March 9, 2026

---

## Files Modified

### 1. Configuration Files

#### ✅ `docker-custom/settings.js`
- **Status:** CREATED
- **Changes:** 
  - Custom editorTheme configuration
  - Page title: "CySOAR - Security Orchestration & Automation"
  - Header title: "CySOAR"
  - Custom logo paths configured
  - Login branding configured

### 2. Branding Assets

#### ✅ `docker-custom/branding/` directory
- **Status:** CREATED
- **Contents:**
  - `favicon.ico` - Browser tab icon (copied from cycentra360-backend)
  - `logo.svg` - Main logo (copied from cycentra360-backend)
  - `logo.png.placeholder` - Placeholder for PNG conversion
  - `logo-login.png.placeholder` - Placeholder for login PNG
  - `README.md` - Instructions for branding assets

**Action Required:** Convert SVG logos to PNG format at appropriate sizes:
```bash
# Use ImageMagick or online tools
convert -background none logo.svg -resize 200x40 logo.png
convert -background none logo.svg -resize 300x100 logo-login.png
```

### 3. Dockerfile Changes

#### ✅ `docker-custom/Dockerfile.custom`
- **Lines Added (after line 42):**
  ```dockerfile
  # Copy CySOAR settings and branding assets
  COPY settings.js /data/settings.js
  COPY branding/favicon.ico /usr/src/node-red/public/favicon.ico
  COPY branding/logo.svg /usr/src/node-red/public/logo.png
  COPY branding/logo.svg /usr/src/node-red/public/logo-login.png
  ```

- **LABEL updates (lines 62-73):**
  - `org.label-schema.name="CySOAR"`
  - `org.label-schema.description="Security Orchestration, Automation and Response Platform"`
  - `org.label-schema.url="https://cycentra.com"`
  - `org.label-schema.vcs-url="https://github.com/cycentra/CySOAR"`
  - `authors="Cycentra Team"`

#### ✅ `docker-custom/Dockerfile.debian`
- **Same changes as Dockerfile.custom**
- Additional fix: Changed empty `org.label-schema.name=""` to `"CySOAR"`

### 4. Package Metadata

#### ✅ `package.json`
- **Changes:**
  - `"name": "cysoar"`
  - `"version": "1.0.0"`
  - `"description": "CySOAR - Security Orchestration, Automation and Response Platform"`
  - `"homepage": "https://cycentra.com"`
  - `"repository.url": "https://github.com/cycentra/CySOAR.git"`
  - `"contributors"`: Updated to "Cycentra Team" with acknowledgment to original Node-RED authors

#### ✅ `docker-custom/package.json`
- **Same changes as root package.json**

### 5. Build Scripts

#### ✅ `docker-custom/docker-alpine.sh`
- **Changes:**
  - Variable name changed from `NODE_RED_VERSION` to `CySOAR`
  - Image tag: `--tag cysoar:latest`
  - Build arg: `--build-arg CySOAR=${CySOAR}`

#### ✅ `docker-custom/docker-debian.sh`
- **Same changes as docker-alpine.sh**

### 6. Documentation

#### ✅ `README.md`
- **Header section:** Updated to describe CySOAR as SOAR platform built on Node-RED
- **Quick Start section:** Changed commands from `nodered/node-red` to `cysoar:latest`
- **Volume names:** Changed from `node_red_data` to `cysoar_data`
- **Container names:** Changed from `mynodered` to `cysoar`

---

## Building CySOAR

### Option 1: Alpine-based (Recommended for production)
```bash
cd /Users/deepakbhatnagar/Documents/GitHub/Custom-Tools/CySOAR/docker-custom
./docker-alpine.sh
```

### Option 2: Debian-based (More compatible)
```bash
cd /Users/deepakbhatnagar/Documents/GitHub/Custom-Tools/CySOAR/docker-custom
./docker-debian.sh
```

---

## Running CySOAR

### Basic Start
```bash
docker run -it -p 1880:1880 -v cysoar_data:/data --name cysoar cysoar:latest
```

### With Docker Compose
```yaml
version: "3.7"

services:
  cysoar:
    image: cysoar:latest
    container_name: cysoar
    environment:
      - TZ=UTC
    ports:
      - "1880:1880"
    volumes:
      - cysoar_data:/data
    restart: unless-stopped

volumes:
  cysoar_data:
```

---

## Verifying Branding

After starting CySOAR:

1. **Browser Tab:** Should show CySOAR favicon
2. **Editor Header:** Should display "CySOAR" with logo
3. **Page Title:** Browser title should be "CySOAR - Security Orchestration & Automation"
4. **Help Menu:** Should link to "CySOAR Help"

---

## Next Steps (Optional)

### 1. Convert Logo Assets
Convert SVG files to PNG at required sizes using ImageMagick or online tools.

### 2. Push to Container Registry
```bash
# Tag for your registry
docker tag cysoar:latest ghcr.io/cycentra/cysoar:latest
docker tag cysoar:latest ghcr.io/cycentra/cysoar:1.0.0

# Push
docker push ghcr.io/cycentra/cysoar:latest
docker push ghcr.io/cycentra/cysoar:1.0.0
```

### 3. Add Custom Nodes
Edit `docker-custom/package.json` and add security-focused nodes:
```json
"dependencies": {
    "node-red": "4.1.7",
    "node-red-node-email": "*",
    "node-red-contrib-slack": "*",
    "@flowfuse/node-red-dashboard": "*"
}
```

### 4. Enable Authentication
Edit `docker-custom/settings.js` and uncomment the `adminAuth` section.

---

## Architecture

```
CySOAR Docker Image
├── Base: Node-RED 4.1.7
├── Runtime: Node.js 20
├── OS: Alpine Linux (or Debian)
├── Settings: Custom settings.js with CySOAR theme
├── Branding: Custom logos and favicon
└── Port: 1880 (HTTP/WebSocket)
```

---

## Maintenance Notes

### Updating Node-RED Version
Edit `docker-custom/package.json`:
```json
"dependencies": {
    "node-red": "4.2.0"  // Update version here
}
```

Then rebuild the image.

### Updating Branding
1. Replace files in `docker-custom/branding/`
2. Rebuild the Docker image
3. Restart containers

---

## Original Node-RED Documentation

The base functionality is from Node-RED Docker (https://github.com/node-red/node-red-docker).

Key differences in CySOAR:
- Custom UI theme and branding
- Pre-configured for SOAR use cases
- Security-focused default configuration
- Cycentra branding and support

For detailed Node-RED documentation, see remaining sections in README.md.

---

**Maintained by:** Cycentra Team  
**Based on:** Node-RED Docker by Dave Conway-Jones, Nick O'Leary, James Thomas, Raymond Mouthaan  
**License:** Apache-2.0
