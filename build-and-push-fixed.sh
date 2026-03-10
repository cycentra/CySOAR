#!/bin/bash
# Build and push CySOAR custom Docker image with tslib fix
# Run this after committing the tslib fix

set -e

cd "$(dirname "$0")"

echo "========================================"
echo "Building CySOAR Custom Image v1.0.1"
echo "========================================"
echo ""

IMAGE_NAME="ghcr.io/cycentra/cysoar"
VERSION="1.0.2"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

echo "📦 Image: $IMAGE_NAME:$VERSION"
echo "📦 Also tagging as: $IMAGE_NAME:latest"
echo "📅 Build date: $BUILD_DATE"
echo ""

echo "🔨 Building multi-architecture image (amd64, arm64)..."
echo ""

# Build for both amd64 and arm64
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --file docker-custom/Dockerfile.custom \
  --tag $IMAGE_NAME:$VERSION \
  --tag $IMAGE_NAME:latest \
  --build-arg BUILD_DATE="$BUILD_DATE" \
  --build-arg BUILD_VERSION="$VERSION" \
  --build-arg NODE_RED_VERSION="1.0.0" \
  --push \
  docker-custom/

echo ""
echo "========================================"
echo "✅ Build and Push Complete!"
echo "========================================"
echo ""
echo "📋 Image Details:"
echo "   Name: $IMAGE_NAME"
echo "   Tags: $VERSION, latest"
echo "   Pushed to: GitHub Container Registry (GHCR)"
echo ""
echo "🔍 Verify the image:"
echo "   docker pull $IMAGE_NAME:latest"
echo "   docker inspect $IMAGE_NAME:latest"
echo ""
echo "🚀 Next Steps on Server:"
echo "   1. Set USE_CUSTOM_IMAGES=yes in /opt/cycentra/.env"
echo "   2. Restart backend: systemctl restart cycentra-backend"
echo "   3. Uninstall CySOAR via portal (if installed)"
echo "   4. Wait 60 seconds for image pull"
echo "   5. Reinstall CySOAR via portal"
echo "   6. Verify no 37/40 hang - should load in 10 seconds"
echo ""
echo "✅ tslib.es6.js fix included"
echo "✅ Null pointer fix included"
echo "✅ All endpoints should work"
