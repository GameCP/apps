#!/bin/bash

# GameCP Extension Deploy Script
# 
# Unified script for deploying extensions to tenants and/or app store.
# Supports multiple environments via .env.local / .env.prod files.
#
# Usage:
#   ./deploy.sh <extension-name> [options]
#
# Options:
#   --env <local|prod>     Environment profile (default: local)
#   --target <target>      Deploy target (default: local)
#                          - local: Just the local/default tenant
#                          - all-tenants: All tenant databases
#                          - appstore: Publish to app store only
#                          - all: All tenants + app store
#   --dry-run              Show what would happen without doing it
#   --yes                  Skip confirmation prompts
#   --help                 Show this help message

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$SCRIPT_DIR/../app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Defaults
ENV_PROFILE="local"
TARGET="local"
DRY_RUN=false
SKIP_CONFIRM=false
EXTENSION_NAME=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENV_PROFILE="$2"
            shift 2
            ;;
        --target)
            TARGET="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --yes|-y)
            SKIP_CONFIRM=true
            shift
            ;;
        --help|-h)
            head -25 "$0" | tail -20
            exit 0
            ;;
        -*)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
        *)
            EXTENSION_NAME="$1"
            shift
            ;;
    esac
done

# Validate extension name
if [ -z "$EXTENSION_NAME" ]; then
    echo -e "${RED}Error: Extension name required${NC}"
    echo "Usage: ./deploy.sh <extension-name> [options]"
    exit 1
fi

# Find extension directory
EXTENSION_DIR=""
if [ -d "$SCRIPT_DIR/$EXTENSION_NAME" ]; then
    EXTENSION_DIR="$SCRIPT_DIR/$EXTENSION_NAME"
elif [ -f "$SCRIPT_DIR/$EXTENSION_NAME/gamecp.json" ]; then
    EXTENSION_DIR="$SCRIPT_DIR/$EXTENSION_NAME"
else
    echo -e "${RED}❌ Extension not found: $EXTENSION_NAME${NC}"
    exit 1
fi

# Load environment file
ENV_FILE="$SCRIPT_DIR/.env.$ENV_PROFILE"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: .env.$ENV_PROFILE${NC}"
    echo "Create it from .env.$ENV_PROFILE.example"
    exit 1
fi

echo -e "${BLUE}📋 Loading environment: .env.$ENV_PROFILE${NC}"
source "$ENV_FILE"

# Validate required env vars
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}❌ MONGODB_URI not set in .env.$ENV_PROFILE${NC}"
    exit 1
fi

# Get extension info
VERSION=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').version)")
NAME=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').name)")
EXT_ID=$(node -e "console.log(require('$EXTENSION_DIR/gamecp.json').extension_id)")

echo ""
echo -e "${GREEN}📦 Extension: $NAME${NC}"
echo -e "   Version: ${YELLOW}v$VERSION${NC}"
echo -e "   ID: $EXT_ID"
echo -e "   Environment: ${BLUE}$ENV_PROFILE${NC}"
echo -e "   Target: ${BLUE}$TARGET${NC}"
if [ "$DRY_RUN" = true ]; then
    echo -e "   Mode: ${YELLOW}DRY RUN${NC}"
fi
echo ""

# Build extension
echo -e "${BLUE}🔨 Building extension...${NC}"
if [ "$DRY_RUN" = true ]; then
    echo "   [DRY RUN] Would run: npm run build in $EXTENSION_DIR"
else
    (cd "$EXTENSION_DIR" && npm run build)
fi

# Confirmation for dangerous targets
if [ "$TARGET" = "all-tenants" ] || [ "$TARGET" = "appstore" ] || [ "$TARGET" = "all" ]; then
    if [ "$SKIP_CONFIRM" = false ] && [ "$DRY_RUN" = false ]; then
        echo ""
        echo -e "${YELLOW}⚠️  WARNING: You are about to deploy to: $TARGET${NC}"
        echo -e "   Environment: $ENV_PROFILE"
        read -p "   Continue? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Aborted."
            exit 0
        fi
    fi
fi

# Function to update a single tenant
update_tenant() {
    local tenant_db="$1"
    local tenant_slug="${tenant_db#gamecp_tenant_}"
    
    cd "$APP_DIR"
    
    if [ "$DRY_RUN" = true ]; then
        # Dry run - check if installed and current version
        node -e "
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('$MONGODB_URI/$tenant_db');
    
    const ext = await mongoose.connection.db.collection('userextensions').findOne(
        { extensionId: '$EXT_ID' }
    );
    
    if (!ext) {
        console.log('   ⏭️  $tenant_slug: Not installed');
    } else if (ext.version === '$VERSION') {
        console.log('   ✓  $tenant_slug: v' + ext.version + ' (already up to date)');
    } else {
        console.log('   📦 $tenant_slug: v' + ext.version + ' → v$VERSION');
    }
    
    await mongoose.disconnect();
}
main().catch(e => { console.error('   ❌ $tenant_slug: ' + e.message); });
"
        return 0
    fi
    
    node -e "
const fs = require('fs');
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('$MONGODB_URI/$tenant_db');
    
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
        console.log('   ⏭️  Not installed in: $tenant_slug');
    } else {
        console.log('   ✅ Updated: $tenant_slug');
    }
    
    await mongoose.disconnect();
}
main().catch(e => { console.error('   ❌ Error in $tenant_slug: ' + e.message); });
"
}

# Function to get all tenant databases
get_all_tenants() {
    cd "$APP_DIR"
    node -e "
const mongoose = require('mongoose');

async function main() {
    await mongoose.connect('$MONGODB_URI/admin');
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    const tenantDbs = dbs.databases
        .map(d => d.name)
        .filter(name => name.startsWith('gamecp_tenant_'));
    
    console.log(tenantDbs.join('\n'));
    await mongoose.disconnect();
}
main().catch(e => { console.error('Error: ' + e.message); process.exit(1); });
"
}

# Function to publish to app store
publish_to_appstore() {
    if [ -z "$GAMECP_PUBLISHER_KEY" ]; then
        echo -e "${RED}❌ GAMECP_PUBLISHER_KEY not set${NC}"
        return 1
    fi
    
    if [ -z "$APPSTORE_API_URL" ]; then
        echo -e "${RED}❌ APPSTORE_API_URL not set${NC}"
        return 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        echo "   [DRY RUN] Would publish to: $APPSTORE_API_URL"
        return 0
    fi
    
    echo -e "${BLUE}📤 Publishing to App Store...${NC}"
    
    cd "$EXTENSION_DIR"
    GAMECP_API_KEY="$GAMECP_PUBLISHER_KEY" node "$SCRIPT_DIR/publish.js" "$APPSTORE_API_URL"
}

# Execute based on target
case $TARGET in
    local)
        echo -e "${BLUE}📥 Updating local tenant...${NC}"
        update_tenant "gamecp_tenant_local"
        ;;
    all-tenants)
        echo -e "${BLUE}📥 Finding all tenants...${NC}"
        TENANTS=$(get_all_tenants)
        TENANT_COUNT=$(echo "$TENANTS" | wc -l | tr -d ' ')
        echo "   Found $TENANT_COUNT tenant(s)"
        echo ""
        echo -e "${BLUE}📥 Updating all tenants...${NC}"
        while IFS= read -r tenant_db; do
            [ -z "$tenant_db" ] && continue
            update_tenant "$tenant_db"
        done <<< "$TENANTS"
        ;;
    appstore)
        publish_to_appstore
        ;;
    all)
        echo -e "${BLUE}📥 Finding all tenants...${NC}"
        TENANTS=$(get_all_tenants)
        TENANT_COUNT=$(echo "$TENANTS" | wc -l | tr -d ' ')
        echo "   Found $TENANT_COUNT tenant(s)"
        echo ""
        echo -e "${BLUE}📥 Updating all tenants...${NC}"
        while IFS= read -r tenant_db; do
            [ -z "$tenant_db" ] && continue
            update_tenant "$tenant_db"
        done <<< "$TENANTS"
        echo ""
        publish_to_appstore
        ;;
    *)
        echo -e "${RED}❌ Unknown target: $TARGET${NC}"
        echo "Valid targets: local, all-tenants, appstore, all"
        exit 1
        ;;
esac

echo ""
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 Dry run complete - no changes made${NC}"
else
    echo -e "${GREEN}✅ Deploy complete!${NC}"
fi
