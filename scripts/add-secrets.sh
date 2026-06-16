#!/bin/bash
# Add GitHub Secrets - Simple API Method

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <github-token>"
    echo ""
    echo "Get a token at: https://github.com/settings/tokens/new"
    echo "Scopes needed: repo, write:packages"
    exit 1
fi

GITHUB_TOKEN="$1"
REPO=$(git config --get remote.origin.url | sed 's/.*\/\([^ ]*\)\/\([^ ]*\)$/\1\/\2/' | sed 's/.git$//')

echo "📦 Adding secrets to: $REPO"
echo ""

# Extract Vercel credentials
if [ -f ".vercel/project.json" ]; then
    VERCEL_TOKEN=$(jq -r '.vercel_token // empty' .vercel/project.json || echo "")
    VERCEL_ORG_ID=$(jq -r '.orgId' .vercel/project.json)
    VERCEL_PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)

    echo "✓ Vercel Project ID: $VERCEL_PROJECT_ID"
    echo "✓ Vercel Org ID: $VERCEL_ORG_ID"
fi

# Try to use GitHub CLI if authenticated
if gh auth status &>/dev/null; then
    echo ""
    echo "Using GitHub CLI..."

    # Provide secrets via stdin to gh
    echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo "$REPO"
    echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo "$REPO"
    echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo "$REPO"

    # Add Supabase if available
    if [ -f ".env.local" ]; then
        SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)
        SUPABASE_KEY=$(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)

        [ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | gh secret set NEXT_PUBLIC_SUPABASE_URL --repo "$REPO"
        [ -n "$SUPABASE_KEY" ] && echo "$SUPABASE_KEY" | gh secret set NEXT_PUBLIC_SUPABASE_ANON_KEY --repo "$REPO"
    fi

    echo ""
    echo "✅ Secrets added successfully!"
else
    echo ""
    echo "GitHub CLI not authenticated. Provide token as environment variable:"
    echo "  export GITHUB_TOKEN='your-token'"
    exit 1
fi

echo ""
echo "🚀 Secrets configured. Try deploying:"
echo "  git push origin master"
