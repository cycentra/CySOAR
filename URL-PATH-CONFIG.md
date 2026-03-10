# URL Path Configuration

## Issue
The CySOAR instance is being accessed at `https://cy360.cycentra.com/node-red/` but should be at `/cysoar/` instead.

## Root Cause
This is a **reverse proxy configuration** issue, not a Docker image issue. The cy360 server has nginx/traefik routing the Node-RED instance through the `/node-red/` path.

## Solution
Update the reverse proxy configuration on the cy360 server. The exact fix depends on your proxy:

### For Nginx
Edit your nginx configuration (likely in `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/`):

```nginx
# Change from:
location /node-red/ {
    proxy_pass http://localhost:1880/;
    ...
}

# To:
location /cysoar/ {
    proxy_pass http://localhost:1880/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # WebSocket support
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

Then reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### For Traefik
Update your docker-compose labels or traefik configuration:

```yaml
labels:
  - "traefik.http.routers.cysoar.rule=Host(`cy360.cycentra.com`) && PathPrefix(`/cysoar`)"
  - "traefik.http.middlewares.cysoar-strip.stripprefix.prefixes=/cysoar"
  - "traefik.http.routers.cysoar.middlewares=cysoar-strip"
```

### For Apache
```apache
<Location /cysoar>
    ProxyPass http://localhost:1880/
    ProxyPassReverse http://localhost:1880/
    ProxyPreserveHost On
</Location>
```

## Alternative: httpAdminRoot in Node-RED
If you want Node-RED itself to serve at `/cysoar`, you can set `httpAdminRoot` in settings.js:

```javascript
module.exports = {
    httpAdminRoot: '/cysoar',
    ...
}
```

**However**, this requires the reverse proxy to pass through the path, which may require additional proxy configuration.

## Current Fix Applied
The Docker image now has proper menu items pointing to `/cysoar/support`, but the URL path itself must be configured at the server/proxy level.
