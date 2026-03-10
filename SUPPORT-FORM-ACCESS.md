# CySOAR Support Form Access Guide

## Issue Summary

When clicking "CySOAR Help" menu item, users are being routed to the cy360 portal page instead of the support form. This is a reverse proxy routing issue on the server.

## Root Cause

1. **React SPA Catch-All**: The cy360 portal (React SPA) is served from `https://cy360.cycentra.com` and has client-side routing that catches ALL routes, including `/cysoar/*`
2. **Proxy Configuration**: nginx needs to proxy `/node-red/` to the Node-RED container BEFORE letting requests fall through to the React SPA

## Solution v1.0.6

We've updated the Docker image to:
- Use `/node-red/support` as the menu URL (matches the server proxy path)
- Support form middleware checks for multiple URL variations
- Use absolute container paths for file access

## Server-Side Fix Required

### Check Current nginx Configuration

```bash
# Find nginx config
sudo cat /etc/nginx/sites-available/cy360

# Or check if it's a traefik/caddy setup
docker ps | grep -E "nginx|traefik|caddy"
```

### Required nginx Configuration

The nginx configuration on `https://cy360.cycentra.com` MUST have this **BEFORE** the React SPA location block:

```nginx
server {
    listen 443 ssl;
    server_name cy360.cycentra.com;

    # ... SSL configuration ...

    # IMPORTANT: Node-RED proxy MUST come BEFORE the React SPA catch-all
    location /node-red/ {
        proxy_pass http://localhost:1880/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support for Node-RED
        proxy_read_timeout 86400;
    }

    # React SPA (catch-all) - MUST be after specific routes
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apply nginx Configuration

```bash
# Edit config
sudo nano /etc/nginx/sites-available/cy360

# Test config
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx
```

## How to Access Support Form

After deploying v1.0.6 and fixing nginx:

### From CySOAR Editor:
1. Click hamburger menu (top-right)
2. Click "CySOAR Help"
3. New tab opens: `https://cy360.cycentra.com/node-red/support`

### Direct URL:
```
https://cy360.cycentra.com/node-red/support
```

## File Locations in Container

```
Container: cysoar (Node-RED)
├── /data/
│   ├── settings.js              (runtime config, copied from image)
│   └── flows.json               (user flows)
├── /usr/src/node-red/
│   └── node_modules/
│       ├── @node-red/
│       │   └── editor-client/
│       │       └── public/
│       │           ├── red/
│       │           │   ├── custom.css
│       │           │   ├── cysoar-init.js
│       │           │   └── cysoar-preload.js
│       │           └── tslib.js
│       └── cysoar-support-system/
│           ├── support-form.html    ← Served by middleware
│           ├── support-handler.js
│           └── package.json
```

## Testing After Deployment

### 1. Deploy v1.0.6

```bash
# On server
docker rmi -f $(docker images -q ghcr.io/cycentra/cysoar)
docker pull ghcr.io/cycentra/cysoar:latest

# Verify digest
docker images | grep cysoar
# Should show: dd7226846b4d or 73980d8ac43f
```

### 2. Test Direct Access

```bash
# From server
curl -I http://localhost:1880/support
# Should return: HTTP/1.1 200 OK

# From browser
https://cy360.cycentra.com/node-red/support
# Should show support form
```

### 3. Test Menu Click

1. Open CySOAR: `https://cy360.cycentra.com/node-red/`
2. Click hamburger menu → "CySOAR Help"
3. Should open new tab with support form
4. URL should be: `https://cy360.cycentra.com/node-red/support`

### 4. Test Form Submission

1. Fill out support form
2. Click "Submit Support Request"
3. Should show success message
4. If SMTP configured: Email sent
5. If SMTP not configured: Request logged to Docker logs

```bash
# Check Docker logs for submission
docker logs $(docker ps -q --filter name=cysoar) | tail -20
```

## Troubleshooting

### Issue: "Support form not found"

**Check 1: Is container running v1.0.6?**
```bash
docker ps --filter name=cysoar --format "{{.Image}}"
# Should show: ghcr.io/cycentra/cysoar:latest

docker inspect $(docker ps -q --filter name=cysoar) | grep -A1 "RepoDigests"
# Should show: dd7226846b4d or 73980d8ac43f
```

**Check 2: Does file exist in container?**
```bash
docker exec -it $(docker ps -q --filter name=cysoar) ls -la /usr/src/node-red/node_modules/cysoar-support-system/
# Should list: support-form.html
```

**Check 3: Can Node-RED access the file?**
```bash
docker exec -it $(docker ps -q --filter name=cysoar) cat /usr/src/node-red/node_modules/cysoar-support-system/support-form.html | head -10
# Should show HTML content
```

### Issue: Still routing to cy360 portal

**Cause**: nginx not configured to proxy `/node-red/` before React SPA

**Fix**: Update nginx config as shown above

**Verify**:
```bash
# Check if proxy is working
curl -I https://cy360.cycentra.com/node-red/support
# Should return: HTTP/2 200

# If returns 404 or shows React HTML:
# nginx is not proxying correctly
```

### Issue: Form submits but no email

**Cause**: SMTP environment variables not configured

**Fix**: Set SMTP variables in docker-compose or .env

```bash
# Check current env vars
docker exec $(docker ps -q --filter name=cysoar) env | grep SMTP

# Should show:
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your-email@domain.com
# SMTP_PASS=your-app-password
# SUPPORT_EMAIL=support@cycentra.com
```

**Configure via cycentra360-backend app.py**:
The compose template in app.py line 788 already includes SMTP env vars.
Just set them in `/opt/cycentra/.env`:

```bash
sudo nano /opt/cycentra/.env

# Add:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@cycentra.com
SMTP_PASS=your-app-password
SUPPORT_EMAIL=support@cycentra.com
```

Then reinstall CySOAR via portal to apply new env vars.

## Version History

- **v1.0.6**: Fixed support form file path (absolute container path)
- **v1.0.5**: Added /node-red/ prefix for proxy routing
- **v1.0.4**: Attempted relative URL routing (didn't work)
- **v1.0.3**: Added httpAdminMiddleware for support form
- **v1.0.2**: Fixed menu items and multiple tab issue
- **v1.0.1**: Fixed tslib missing issue (37/40 hang)
- **v1.0.0**: Initial whitelabeled CySOAR release

## Summary

✅ **v1.0.6 fixes the "Support form not found" error**
⚠️ **Server nginx config MUST proxy /node-red/ to port 1880**
📝 **Without proper nginx config, all /node-red/ requests go to React SPA**

Deploy v1.0.6, configure nginx, test direct URL access first!
