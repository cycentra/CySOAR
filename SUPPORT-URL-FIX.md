# CySOAR Support URL Fix - v1.0.8

## Problem Summary
**Issue:** Clicking "CySOAR Help" menu opens `https://cy360.cycentra.com/cysoar/support` (wrong URL) instead of `https://cy360.cycentra.com/node-red/support` (correct URL)

## Root Cause
**cysoar-init.js was OVERRIDING settings.js menu URL!**

The client-side JavaScript file `cysoar-init.js` contains a `fixMenuItems()` function that:
1. Runs after the Node-RED editor page loads
2. Searches for menu items with "Node-RED website" text
3. Replaces the link href with a hardcoded URL: `/cysoar/support`
4. Runs every 5 seconds to catch dynamically added menu items

This explains why all changes to `settings.js` didn't work - the JavaScript was constantly overriding the settings!

## Solution Implemented in v1.0.8

### Files Changed:
1. **docker-custom/branding/cysoar-init.js**
   - Line 134: Changed `link.href = '/cysoar/support'` → `link.href = '/node-red/support'`
   - Line 143: Changed `link.href = '/cysoar/support'` → `link.href = '/node-red/support'`

2. **build-and-push-fixed.sh**
   - Updated version from 1.0.7 → 1.0.8

### What This Fixes:
- ✅ CySOAR Help menu now opens `/node-red/support` URL
- ✅ Support form loads correctly (no more cy360 portal page)
- ✅ Both settings.js AND client-side JS now point to same correct URL
- ✅ No more conflicting URL configurations

## Deployment on DEV-MGMT Server

### Step 1: Pull New Image
```bash
# SSH to DEV-MGMT server
ssh deepak@cy360.cycentra.com

# Pull latest image (v1.0.8)
docker pull ghcr.io/cycentra/cysoar:latest

# Verify image version
docker images | grep cysoar
```

### Step 2: Reinstall CySOAR
```bash
# Option A: Via Portal (Recommended)
1. Open https://cy360.cycentra.com/portal/
2. Go to "Plugins" page
3. Click Uninstall on CySOAR
4. Wait 60 seconds for cleanup
5. Click Install on CySOAR
6. Wait for installation to complete

# Option B: Via Command Line
docker stop $(docker ps -q --filter name=cysoar)
docker rm $(docker ps -aq --filter name=cysoar)
docker volume rm cysoar-data
systemctl restart cycentra-backend
# Wait 60 seconds then install via portal
```

### Step 3: Clear Browser Cache
**IMPORTANT:** Old browser cache may still have the old JavaScript!

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R

OR use Incognito/Private window
```

### Step 4: Verify Fix
1. Open https://cy360.cycentra.com/node-red/
2. Login to CySOAR
3. Click hamburger menu (top-right)
4. Click "CySOAR Help"
5. **Expected:** Opens https://cy360.cycentra.com/node-red/support ✅
6. **Expected:** Shows support form (not cy360 portal) ✅

## Technical Details

### Menu Item Configuration Chain:
1. **settings.js editorTheme.menu** (Line ~380): Defines initial menu with URL `/node-red/support`
2. **Node-RED loads editor** → Menu rendered with settings.js URL
3. **cysoar-init.js loads** (~100ms after page load) → Runs `fixMenuItems()`
4. **fixMenuItems() finds menu** → Replaces href with `/node-red/support` (v1.0.8) ✅
5. **Periodic refresh** → Runs every 5 seconds to catch dynamic menus

### Why Previous Fixes Didn't Work:
- v1.0.2-v1.0.7: Only modified `settings.js`
- Problem: `cysoar-init.js` still had `/cysoar/support` hardcoded
- Result: JavaScript overwrote settings.js every 5 seconds!

### Why v1.0.8 Works:
- Both files now have same URL: `/node-red/support`
- No more conflict between settings and client-side JS
- Menu URL remains stable

## Nginx Proxy Configuration
*(For reference - no changes needed)*

```nginx
location /node-red/ {
    proxy_pass http://localhost:1880/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

When user clicks menu:
1. Browser requests: `https://cy360.cycentra.com/node-red/support`
2. Nginx proxies to: `http://localhost:1880/support`
3. Node-RED middleware serves: `support-form.html`

## Version History

- **v1.0.8** (2026-03-11): Fixed cysoar-init.js to use /node-red/support URL ✅
- **v1.0.7** (2026-03-10): Cleaned duplicate entries in settings.js
- **v1.0.6** (2026-03-10): Fixed support form file path to absolute container path
- **v1.0.5** (2026-03-10): Changed menu URL to /node-red/support in settings.js
- **v1.0.4** (2026-03-10): Attempted relative URLs (didn't work)
- **v1.0.3** (2026-03-10): Added httpAdminMiddleware for support form
- **v1.0.2** (2026-03-10): Fixed menu items and multiple tab issue

## Files Involved

### Container Paths:
- Settings: `/data/settings.js`
- Support form: `/usr/src/node-red/node_modules/cysoar-support-system/support-form.html`
- Init script: `/usr/src/node-red/node_modules/@node-red/editor-client/public/cysoar-init.js`

### Repository Paths:
- `docker-custom/settings.js` → Menu configuration (settings.js)
- `docker-custom/branding/cysoar-init.js` → Client-side JS overrides
- `docker-custom/branding/support-form.html` → Support request form HTML
- `build-and-push-fixed.sh` → Multi-arch Docker build script

## Troubleshooting

### If menu still shows old URL:
1. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Try incognito window** - If works, it's browser cache
3. **Check container version:**
   ```bash
   docker ps --filter name=cysoar --format "{{.Image}}"
   # Should show: ghcr.io/cycentra/cysoar:latest
   
   docker images | grep cysoar
   # Look for recent creation date
   ```
4. **Verify cysoar-init.js in container:**
   ```bash
   docker exec $(docker ps -q --filter name=cysoar) \
     grep "link.href = '/node-red/support'" \
     /usr/src/node-red/node_modules/@node-red/editor-client/public/cysoar-init.js
   # Should find 2 matches (lines 134 and 143)
   ```

### If support form shows "not found":
1. **Check middleware in settings.js:**
   ```bash
   docker exec $(docker ps -q --filter name=cysoar) \
     grep -A10 "httpAdminMiddleware" /data/settings.js
   ```
2. **Verify support form file exists:**
   ```bash
   docker exec $(docker ps -q --filter name=cysoar) \
     ls -la /usr/src/node-red/node_modules/cysoar-support-system/support-form.html
   ```

## Summary
✅ **Root cause:** cysoar-init.js JavaScript overriding settings.js  
✅ **Solution:** Update cysoar-init.js to use /node-red/support  
✅ **Version:** v1.0.8  
✅ **Status:** Built and pushed to GHCR  
⏳ **Next:** Deploy on server and clear browser cache
