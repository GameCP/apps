#!/bin/bash

# GameCP Extension Local Update Script
# 
# Directly updates installed extensions in tenant databases from local dist files.
# This is for LOCAL DEVELOPMENT only - bypasses the appstore.
# 
# Usage: ./update-local.sh [extension-name] [tenant-slug]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../app"
MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017}"
DEFAULT_TENANT="${DEFAULT_TENANT:-local}"

usage() {
    echo "
📦 GameCP Extension Local Updater

Updates installed extensions directly from local dist files (dev mode).

Usage: 
  ./update-local.sh <extension-name>              # Update in default tenant
  ./update-local.sh <extension-name> <tenant>     # Update in specific tenant

Environment:
  MONGODB_URI     - MongoDB connection string (default: mongodb://127.0.0.1:27017)
  DEFAULT_TENANT  - Default tenant slug (default: local)

Example:
  ./update-local.sh game-scheduler
  ./update-local.sh game-scheduler demo
"
}

if [ -z "$1" ] || [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    usage
    exit 0
fi

EXTENSION_NAME="$1"
TENANT_SLUG="${2:-$DEFAULT_TENANT}"

# Find extension directory
if [ -d "$SCRIPT_DIR/$EXTENSION_NAME" ]; then
    EXTENSION_DIR="$SCRIPT_DIR/$EXTENSION_NAME"
elif [ -f "$SCRIPT_DIR/$EXTENSION_NAME/gamecp.json" ]; then
    EXTENSION_DIR="$SCRIPT_DIR/$EXTENSION_NAME"
else
    echo "❌ Extension not found: $EXTENSION_NAME"
    exit 1
fi

# Check for dist
if [ ! -d "$EXTENSION_DIR/dist" ]; then
    echo "⚠️  No dist folder. Running npm run build first..."
    (cd "$EXTENSION_DIR" && npm run build)
fi

# Get version from manifest
VERSION=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').version)")
NAME=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').name)")
EXT_ID=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').extension_id)")

echo "📦 Updating $NAME v$VERSION in tenant: $TENANT_SLUG"

# Run the update using Node from app directory (which has mongoose)
cd "$APP_DIR"
node -e "
const fs = require('fs');
const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('$MONGODB_URI/gamecp_tenant_$TENANT_SLUG');
  
  const uiBundle = fs.readFileSync('$EXTENSION_DIR/dist/index.js', 'utf-8');
  const handlersBundle = fs.readFileSync('$EXTENSION_DIR/dist/handlers.js', 'utf-8');
  const manifest = JSON.parse(fs.readFileSync('$EXTENSION_DIR/gamecp.json', 'utf-8'));
  
  const result = await mongoose.connection.db.collection('userextensions').updateOne(
    { extensionId: '$EXT_ID' },
    { 
      \$set: { 
        bundleCode: uiBundle,
        handlerCode: handlersBundle,
        manifest: manifest,
        version: manifest.version,
        name: manifest.name,
        description: manifest.description,
        updatedAt: new Date()
      } 
    }
  );
  
  if (result.matchedCount === 0) {
    console.log('❌ Extension not installed in tenant: $TENANT_SLUG');
    process.exit(1);
  }
  
  console.log('✅ Updated to v' + manifest.version);
  await mongoose.disconnect();
}
main().catch(e => { console.error('❌ ' + e.message); process.exit(1); });
"

echo ""
echo "🔄 Refresh your browser to see changes!"
