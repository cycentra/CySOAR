# Deploy CySOAR v1.0.9 - URL Change to /cysoar/

## Quick Summary
✅ Built: v1.0.9  
✅ Change: URLs changed from `/node-red/` to `/cysoar/`  
⏳ Status: Ready to deploy  

## Step-by-Step Deployment

### Step 1: Update Nginx Configuration on Server

SSH to the server and edit nginx config:

```bash
ssh deepak@cy360.cycentra.com

# Edit nginx configuration
sudo nano /etc/nginx/sites-available/cycentra360

# Find the location block for /node-red/ and change it to /cysoar/
```

**Find this block:**
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

**Change to:**
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

**Save and test:**
```bash
# Test nginx configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx

# Verify the change
curl -I https://cy360.cycentra.com/cysoar/
# Should return: HTTP/1.1 401 Unauthorized (means CySOAR requires auth, which is correct)
```

### Step 2: Deploy CySOAR v1.0.9

```bash
# Still on DEV-MGMT server

# Pull the latest image
docker pull ghcr.io/cycentra/cysoar:latest

# Verify image version
docker images | grep cysoar
# Should show recent creation time
```

### Step 3: Reinstall CySOAR

**Option A: Via Portal (Recommended)**
1. Open: https://cy360.cycentra.com/portal/
2. Navigate to "Plugins" page
3. Find CySOAR and click "Uninstall"
4. Wait 60 seconds for cleanup
5. Click "Install" on CySOAR
6. Wait for installation to complete

**Option B: Via Command Line**
```bash
# Stop and remove existing container
docker stop $(docker ps -q --filter name=cysoar)
docker rm $(docker ps -aq --filter name=cysoar)
docker volume rm cysoar-data

# Restart backend to trigger reinstall
systemctl restart cycentra-backend

# Wait 60 seconds, then install via portal
```

### Step 4: Clear Browser Cache

**IMPORTANT:** Browser has cached JavaScript from previous versions!

**Method 1: Hard Refresh**
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Method 2: Incognito Window**
```
Chrome: Ctrl + Shift + N (Windows) / Cmd + Shift + N (Mac)
Firefox: Ctrl + Shift + P (Windows) / Cmd + Shift + P (Mac)
Safari: Cmd + Shift + N
```

**Method 3: Clear Site Data (DevTools)**
1. Press F12 to open DevTools
2. Go to Application tab
3. Click "Clear site data" 
4. Reload page

### Step 5: Verify Deployment

**Test 1: Access CySOAR Editor**
```
URL: https://cy360.cycentra.com/cysoar/
Expected: CySOAR login page ✅
```

**Test 2: Login and Access Editor**
1. Login with credentials
2. Editor should load (no 37/40 hang)
3. Check URL bar: Should show `/cysoar/` ✅

**Test 3: Support Form Access**
1. Click hamburger menu (top-right, 3 lines)
2. Click "CySOAR Help"
3. **Expected URL:** `https://cy360.cycentra.com/cysoar/support` ✅
4. **Expected page:** Support request form (NOT cy360 portal) ✅

**Test 4: Submit Support Form**
1. Fill out the form with test data:
   - Name: Test User
   - Email: test@example.com
   - Subject: Testing v1.0.9
   - Description: Verifying support form works
2. Click Submit
3. **Expected:** Green success message ✅
4. **Expected:** Redirects back after 3 seconds ✅

**Test 5: Check Browser Console**
1. Press F12 to open DevTools
2. Go to Console tab
3. Look for: `✓ Updated Node-RED website link to CySOAR Help` ✅
4. Should see NO 404 errors ✅
5. Should see NO MIME type errors ✅

### Step 6: Check Logs (Optional)

```bash
# On server, check nginx logs
sudo tail -f /var/log/nginx/access.log | grep cysoar

# Check Docker logs
docker logs $(docker ps -q --filter name=cysoar) --tail 50

# Should see support form requests
```

## URL Changes Summary

| Item | Old URL (v1.0.8) | New URL (v1.0.9) |
|------|-----------------|-----------------|
| **CySOAR Editor** | `https://cy360.cycentra.com/node-red/` | `https://cy360.cycentra.com/cysoar/` |
| **Support Form** | `https://cy360.cycentra.com/node-red/support` | `https://cy360.cycentra.com/cysoar/support` |
| **Submit API** | `https://cy360.cycentra.com/node-red/support/submit` | `https://cy360.cycentra.com/cysoar/support/submit` |

## What Changed in v1.0.9

1. **settings.js**
   - Menu URL: `/node-red/support` → `/cysoar/support`
   - Middleware: `/node-red/support` → `/cysoar/support`
   - Submit endpoint: `/node-red/support/submit` → `/cysoar/support/submit`

2. **cysoar-init.js**
   - Client-side menu override: `/node-red/support` → `/cysoar/support`

3. **support-form.html**
   - Form submission URL: `/node-red/support/submit` → `/cysoar/support/submit`

## Troubleshooting

### Issue: "404 Not Found" when accessing /cysoar/
**Solution:** Nginx config not updated or not reloaded
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: Old URL still showing (/node-red/)
**Solution:** Browser cache not cleared
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
OR use incognito window
```

### Issue: Support form shows "not found"
**Solution:** 
1. Check image version: `docker images | grep cysoar`
2. Should show v1.0.9 or recent creation time
3. If old version, pull again: `docker pull ghcr.io/cycentra/cysoar:latest`
4. Reinstall via portal

### Issue: Menu still goes to wrong URL
**Solution:** 
1. Clear browser cache completely
2. Check browser console (F12) for errors
3. Verify container has correct settings:
```bash
docker exec $(docker ps -q --filter name=cysoar) \
  grep -A2 '"menu-item-cysoar-help"' /data/settings.js
# Should show: url: "/cysoar/support"
```

## Rollback Plan

If issues occur, revert to v1.0.8:

```bash
# On server, restore nginx config
sudo nano /etc/nginx/sites-available/cycentra360
# Change /cysoar/ back to /node-red/

sudo nginx -t && sudo systemctl reload nginx

# Pull v1.0.8 image
docker pull ghcr.io/cycentra/cysoar:1.0.8

# Tag as latest locally
docker tag ghcr.io/cycentra/cysoar:1.0.8 ghcr.io/cycentra/cysoar:latest

# Reinstall via portal
```

## Post-Deployment Checklist

- [ ] Nginx config updated (/cysoar/ location block)
- [ ] Nginx reloaded successfully
- [ ] Docker image v1.0.9 pulled
- [ ] CySOAR reinstalled via portal
- [ ] Browser cache cleared (hard refresh)
- [ ] Can access: https://cy360.cycentra.com/cysoar/
- [ ] Can login to CySOAR editor
- [ ] Palette loads without hanging (no 37/40 issue)
- [ ] Menu → CySOAR Help opens `/cysoar/support`
- [ ] Support form displays correctly
- [ ] Can submit support form successfully
- [ ] No errors in browser console

## Documentation

Complete documentation available in repository:
- `CYSOAR-URL-CHANGE.md` - Detailed technical documentation
- `SUPPORT-URL-FIX.md` - Previous support form fix documentation

## Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check docker logs: `docker logs $(docker ps -q --filter name=cysoar)`
4. Verify nginx config: `sudo nginx -t`
5. Verify container version: `docker images | grep cysoar`

## Summary

**What we did:**
1. ✅ Changed all URLs from `/node-red/` to `/cysoar/`
2. ✅ Built and pushed v1.0.9 image
3. ✅ Created deployment documentation

**What you need to do:**
1. ⏳ Update nginx config on server
2. ⏳ Deploy v1.0.9 image
3. ⏳ Clear browser cache
4. ⏳ Verify everything works

**Expected result:**
- CySOAR accessible at `https://cy360.cycentra.com/cysoar/`
- Support form at `https://cy360.cycentra.com/cysoar/support`
- Better branding consistency (no more "node-red" in URLs)
