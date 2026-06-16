#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Clube+ Assinaturas - Vercel & GitHub Setup${NC}"
echo "=================================================="

# Check required tools
echo -e "\n${BLUE}1. Checking required tools...${NC}"
for tool in gh vercel git; do
    if ! command -v $tool &> /dev/null; then
        echo -e "${YELLOW}⚠️  $tool not found${NC}"
    else
        version=$($tool --version 2>&1 | head -1)
        echo -e "${GREEN}✓ $tool: $version${NC}"
    fi
done

# Check GitHub auth
echo -e "\n${BLUE}2. Checking GitHub authentication...${NC}"
if gh auth status &> /dev/null; then
    GITHUB_USER=$(gh api user --jq '.login')
    echo -e "${GREEN}✓ Logged in as: $GITHUB_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository info
REPO_URL=$(git -C . remote get-url origin)
REPO_PATH="${REPO_URL#https://github.com/}"
REPO_PATH="${REPO_PATH%.git}"
IFS='/' read -r GITHUB_ORG GITHUB_REPO <<< "$REPO_PATH"

echo -e "${GREEN}✓ Repository: $GITHUB_ORG/$GITHUB_REPO${NC}"

# Check Vercel auth
echo -e "\n${BLUE}3. Checking Vercel authentication...${NC}"
if vercel whoami &> /dev/null; then
    VERCEL_USER=$(vercel whoami 2>&1 || echo "unknown")
    echo -e "${GREEN}✓ Vercel user: $VERCEL_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Not authenticated with Vercel${NC}"
    echo "Please run: vercel login"
    exit 1
fi

# Create/Link Vercel project
echo -e "\n${BLUE}4. Setting up Vercel project...${NC}"

VERCEL_JSON=".vercel/project.json"
if [ ! -f "$VERCEL_JSON" ]; then
    echo "Creating new Vercel project..."
    vercel --yes --confirm --skip-questions 2>&1 | head -20
else
    echo -e "${GREEN}✓ Vercel project already linked${NC}"
fi

# Extract project credentials
if [ -f "$VERCEL_JSON" ]; then
    VERCEL_ORG_ID=$(grep -o '"orgId":"[^"]*' "$VERCEL_JSON" | cut -d'"' -f4)
    VERCEL_PROJECT_ID=$(grep -o '"projectId":"[^"]*' "$VERCEL_JSON" | cut -d'"' -f4)
    echo -e "${GREEN}✓ Project ID: $VERCEL_PROJECT_ID${NC}"
    echo -e "${GREEN}✓ Org ID: $VERCEL_ORG_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Could not find project credentials${NC}"
    echo "Please visit https://vercel.com/dashboard and get your credentials"
    exit 1
fi

# Generate Vercel token if needed
echo -e "\n${BLUE}5. Checking Vercel token...${NC}"
if [ -z "$VERCEL_TOKEN" ]; then
    echo "Creating Vercel token via API..."
    # This requires authentication, so we'll get it from the CLI config
    VERCEL_TOKEN=$(vercel env pull --yes --environment=production 2>&1 | grep -o 'token.*' || echo "")
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  Could not auto-generate Vercel token${NC}"
        echo "Please create a token at: https://vercel.com/account/tokens"
        echo "Then set it as VERCEL_TOKEN environment variable"
        exit 1
    fi
else
    echo -e "${GREEN}✓ VERCEL_TOKEN already set${NC}"
fi

# Set GitHub secrets
echo -e "\n${BLUE}6. Setting GitHub secrets...${NC}"

SECRETS=(
    "VERCEL_TOKEN:$VERCEL_TOKEN"
    "VERCEL_ORG_ID:$VERCEL_ORG_ID"
    "VERCEL_PROJECT_ID:$VERCEL_PROJECT_ID"
)

for secret in "${SECRETS[@]}"; do
    IFS=':' read -r KEY VALUE <<< "$secret"
    if [ -n "$VALUE" ]; then
        echo "Setting $KEY..."
        echo "$VALUE" | gh secret set "$KEY" --repo "$GITHUB_ORG/$GITHUB_REPO"
        echo -e "${GREEN}✓ $KEY set${NC}"
    fi
done

# Set Supabase secrets if available
echo -e "\n${BLUE}7. Setting Supabase secrets (if available)...${NC}"

if [ -f ".env.local" ]; then
    SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)
    SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)

    if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
        echo "$SUPABASE_URL" | gh secret set NEXT_PUBLIC_SUPABASE_URL --repo "$GITHUB_ORG/$GITHUB_REPO"
        echo "$SUPABASE_KEY" | gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo "$GITHUB_ORG/$GITHUB_REPO"
        echo -e "${GREEN}✓ Supabase secrets set${NC}"
    fi
fi

# Verify secrets
echo -e "\n${BLUE}8. Verifying secrets...${NC}"
gh secret list --repo "$GITHUB_ORG/$GITHUB_REPO"

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}GitHub Actions will now deploy automatically on push to master${NC}"
echo -e "Monitor deployments at: https://github.com/$GITHUB_ORG/$GITHUB_REPO/actions"
echo -e "View Vercel dashboard at: https://vercel.com"
