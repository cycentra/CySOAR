# Change CySOAR URL from /node-red/ to /cysoar/

## Overview
This change updates the CySOAR proxy path from `/node-red/` to `/cysoar/` for better branding consistency.

## Changes Required

### 1. Server: Update Nginx Configuration

**File:** `/etc/nginx/sites-available/cycentra360` or `/etc/nginx/conf.d/cycentra360.conf`

**Change this:**
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

**To this:**
```nginx
location /cysoar/ {
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

**Apply changes:**
```bash
# SSH to DEV-MGMT server
ssh deepak@cy360.cycentra.com

# Edit nginx config
sudo nano /etc/nginx/sites-available/cycentra360

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Verify
curl -I https://cy360.cycentra.com/cysoar/
```

### 2. Docker Image: Deploy v1.0.9

**Changes in v1.0.9:**
- ✅ `settings.js` - Menu URL changed from `/node-red/support` → `/cysoar/support`
- ✅ `settings.js` - Middleware paths updated to handle `/cysoar/support`
- ✅ `cysoar-init.js` - Menu URL override changed to `/cysoar/support`
- ✅ `support-form.html` - Form submission URL changed to `/cysoar/support/submit`

**Build and push:**
```bash
# On local machine
cd ~/Documents/GitHub/Custom-Tools/CySOAR
./build-and-push-fixed.sh
```

**Deploy on server:**
```bash
# SSH to DEV-MGMT
ssh deepak@cy360.cycentra.com

# Pull new image
docker pull ghcr.io/cycentra/cysoar:latest

# Reinstall via portal
# 1. Open https://cy360.cycentra.com/portal/
# 2. Go to Plugins page
# 3. Uninstall CySOAR
# 4. Wait 60 seconds
# 5. Install CySOAR
```

### 3. Clear Browser Cache
After deployment, users need to clear browser cache:
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R

OR use Incognito/Private window
```

## URL Mapping

### Before (v1.0.8):
- CySOAR Editor: `https://cy360.cycentra.com/node-red/`
- Support Form: `https://cy360.cycentra.com/node-red/support`
- API Endpoint: `https://cy360.cycentra.com/node-red/support/submit`

### After (v1.0.9):
- CySOAR Editor: `https://cy360.cycentra.com/cysoar/`
- Support Form: `https://cy360.cycentra.com/cysoar/support`
- API Endpoint: `https://cy360.cycentra.com/cysoar/support/submit`

## Request Flow

### User clicks "CySOAR Help" menu:
1. Browser navigates to: `https://cy360.cycentra.com/cysoar/support`
2. Nginx receives request at `/cysoar/support`
3. Nginx proxies to: `http://localhost:1880/support` (strips `/cysoar/` prefix)
4. Node-RED middleware in `settings.js` checks:
   - Is URL `/support` or `/cysoar/support`? → YES
5. Middleware serves: `/usr/src/node-red/node_modules/cysoar-support-system/support-form.html`
6. User sees support form ✅

### User submits form:
1. JavaScript POSTs to: `https://cy360.cycentra.com/cysoar/support/submit`
2. Nginx proxies to: `http://localhost:1880/support/submit`
3. Node-RED middleware checks:
   - Is URL `/support/submit` or `/cysoar/support/submit`? → YES
4. Middleware processes form and sends email ✅

## Verification Steps

### 1. Test Nginx Proxy
```bash
# On server
curl -I https://cy360.cycentra.com/cysoar/
# Expected: HTTP/1.1 200 OK

# Check logs
sudo tail -f /var/log/nginx/access.log | grep cysoar
```

### 2. Test CySOAR Access
1. Open: `https://cy360.cycentra.com/cysoar/`
2. Should see: CySOAR login page ✅
3. Login and verify editor loads

### 3. Test Support Form
1. Click hamburger menu (top-right)
2. Click "CySOAR Help"
3. Expected URL: `https://cy360.cycentra.com/cysoar/support` ✅
4. Should see: Support request form ✅
5. Fill form and submit
6. Expected: "Success!" message ✅

### 4. Check Browser Console
Open DevTools (F12):
- No 404 errors ✅
- Console log: "✓ Updated Node-RED website link to CySOAR Help" ✅

## Rollback Plan

If issues occur, revert nginx config:

```bash
# On server
sudo nano /etc/nginx/sites-available/cycentra360

# Change back to /node-red/
location /node-red/ {
    proxy_pass http://localhost:1880/;
    # ... rest of config
}

# Reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Reinstall v1.0.8
docker pull ghcr.io/cycentra/cysoar:1.0.8
# Then reinstall via portal
```

## Files Changed

### Repository files:
- `docker-custom/settings.js` - Middleware paths and menu URL
- `docker-custom/branding/cysoar-init.js` - Client-side menu URL override
- `docker-custom/branding/support-form.html` - Form submission endpoint
- `build-and-push-fixed.sh` - Version updated to 1.0.9

### Server files:
- `/etc/nginx/sites-available/cycentra360` - Proxy location block

## Notes

**Why both `/support` and `/cysoar/support` in middleware?**
- `/cysoar/support` - Full URL when accessed directly
- `/support` - Stripped path after nginx proxy_pass (nginx removes `/cysoar/` prefix)

Middleware handles both to ensure form loads regardless of how user accesses it.

**Backward compatibility:**
After this change, old `/node-red/` URLs will return 404. Update any:
- Bookmarks
- Documentation
- External links
- Integration configs

## Summary
✅ **Change:** `/node-red/` → `/cysoar/`  
✅ **Version:** v1.0.9  
✅ **Impact:** URL branding improvement  
✅ **Risk:** Low - similar to v1.0.8 architecture  
⏳ **Action:** Update nginx config + deploy v1.0.9
