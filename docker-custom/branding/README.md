# CySOAR Branding Assets

This directory contains all branding assets used in the CySOAR (Node-RED) interface.

## Required Files

### 1. favicon.ico
- **Purpose:** Browser tab icon
- **Format:** ICO file with multiple sizes (16x16, 32x32, 48x48)
- **Used in:** Browser tabs, bookmarks
- **Referenced in:** settings.js → editorTheme.page.favicon

### 2. logo.png
- **Purpose:** Main header logo in the editor
- **Recommended size:** 200x40px (or maintain aspect ratio)
- **Format:** PNG with transparency
- **Used in:** Top-left corner of Node-RED editor
- **Referenced in:** settings.js → editorTheme.header.image

### 3. logo-login.png
- **Purpose:** Login page logo (if authentication is enabled)
- **Recommended size:** 300x100px
- **Format:** PNG with transparency
- **Used in:** Login screen
- **Referenced in:** settings.js → editorTheme.login.image

### 4. icon.svg (optional)
- **Purpose:** Application icon
- **Recommended size:** 256x256px or scalable vector
- **Format:** SVG
- **Used in:** Application icons, splash screens

## Creating Assets

You can use the existing CyCentra branding assets from:
- `/cycentra360-backend/assets/logos/icon_light.svg`
- `/cycentra360-backend/assets/logos/app-logos/app.svg`
- `/cycentra360-backend/assets/favicons/favicon-32x32.png`

Convert SVG logos to PNG at appropriate sizes using:
```bash
# For macOS (using ImageMagick or similar)
convert -background none input.svg -resize 200x40 logo.png
convert -background none input.svg -resize 300x100 logo-login.png
```

## File Placement

During Docker build, these files are copied to:
- `/usr/src/node-red/public/favicon.ico`
- `/usr/src/node-red/public/logo.png`
- `/usr/src/node-red/public/logo-login.png`
- `/usr/src/node-red/public/icon.svg`

## Testing

After building the Docker image, verify branding by:
1. Starting the container
2. Opening http://localhost:1880 in browser
3. Checking that CySOAR logos appear in header and browser tab
