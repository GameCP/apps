#!/bin/bash

# Publish all GameCP extensions to the app store
# Usage: ./publish-all.sh [--env local|prod] [--force] [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Defaults
ENV_PROFILE="prod"
FORCE_FLAG=""
DRY_RUN=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENV_PROFILE="$2"
            shift 2
            ;;
        --force|-f)
            FORCE_FLAG="--force"
            shift
            ;;
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        --help|-h)
            echo "Usage: ./publish-all.sh [options]"
            echo ""
            echo "Options:"
            echo "  --env <local|prod>  Environment (default: prod)"
            echo "  --force, -f         Force overwrite existing versions"
            echo "  --dry-run           Show what would happen"
            echo "  --help, -h          Show this help"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Load environment file
ENV_FILE="$SCRIPT_DIR/.env.$ENV_PROFILE"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Environment file not found: .env.$ENV_PROFILE${NC}"
    echo "Create it with GAMECP_PUBLISHER_KEY and APPSTORE_API_URL"
    exit 1
fi

echo -e "${BLUE}📋 Loading environment: .env.$ENV_PROFILE${NC}"
source "$ENV_FILE"

if [ -z "$GAMECP_PUBLISHER_KEY" ]; then
    echo -e "${RED}❌ GAMECP_PUBLISHER_KEY not set in .env.$ENV_PROFILE${NC}"
    exit 1
fi

if [ -z "$APPSTORE_API_URL" ]; then
    echo -e "${RED}❌ APPSTORE_API_URL not set in .env.$ENV_PROFILE${NC}"
    exit 1
fi

# List of extensions to publish
EXTENSIONS=(
    "database-manager"
    "discord-notifications"
    "game-scheduler"
    "server-notes"
    "brand-kit"
)

echo ""
echo -e "${GREEN}📦 Publishing ${#EXTENSIONS[@]} extensions to App Store${NC}"
echo -e "   Environment: ${BLUE}$ENV_PROFILE${NC}"
echo -e "   App Store: ${BLUE}$APPSTORE_API_URL${NC}"
if [ -n "$FORCE_FLAG" ]; then
    echo -e "   Mode: ${YELLOW}FORCE OVERWRITE${NC}"
fi
if [ -n "$DRY_RUN" ]; then
    echo -e "   Mode: ${YELLOW}DRY RUN${NC}"
fi
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_EXTENSIONS=()

for ext in "${EXTENSIONS[@]}"; do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}📦 Publishing: $ext${NC}"
    echo ""
    
    if [ -n "$DRY_RUN" ]; then
        echo -e "   ${YELLOW}[DRY RUN] Would run:${NC}"
        echo "   ./deploy.sh $ext --target appstore --env $ENV_PROFILE $FORCE_FLAG"
        ((SUCCESS_COUNT++))
    else
        if ./deploy.sh "$ext" --target appstore --env "$ENV_PROFILE" --yes $FORCE_FLAG; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
            FAILED_EXTENSIONS+=("$ext")
            echo -e "${RED}❌ Failed to publish $ext${NC}"
        fi
    fi
    echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📊 Summary:${NC}"
echo -e "   ✅ Successful: $SUCCESS_COUNT"
echo -e "   ❌ Failed: $FAIL_COUNT"

if [ $FAIL_COUNT -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed extensions:${NC}"
    for failed in "${FAILED_EXTENSIONS[@]}"; do
        echo -e "   - $failed"
    done
    exit 1
fi

echo ""
if [ -n "$DRY_RUN" ]; then
    echo -e "${YELLOW}🔍 Dry run complete - no changes made${NC}"
else
    echo -e "${GREEN}✅ All extensions published successfully!${NC}"
fi

