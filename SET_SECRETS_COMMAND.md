# 🔐 Set GitHub Secrets Command

Run this command to add all required secrets to your GitHub repository.

## Prerequisites

You need:
1. **GitHub Personal Access Token** (from https://github.com/settings/tokens/new)
   - Scopes: `repo`, `write:packages`
2. **Vercel Credentials** (should be already set up)

## Option 1: Using GitHub CLI (Easiest)

If you have `gh` CLI installed and authenticated:

```bash
# First, authenticate with GitHub
gh auth login

# Then run from the project directory
export VERCEL_TOKEN="vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ"
export VERCEL_ORG_ID="team_TUkp3rkTDToUqrh0jYV4VW2k"
export VERCEL_PROJECT_ID="prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI"

# Add each secret
echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo chausselicita-lang/clube-assinaturas
echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo chausselicita-lang/clube-assinaturas
echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo chausselicita-lang/clube-assinaturas

# Also add Supabase if available
# (automatically reads from .env.local)
```

## Option 2: Using PowerShell Script

```powershell
# Create a GitHub token first at https://github.com/settings/tokens/new
$githubToken = "github_pat_XXXXXXXXX"  # Replace with your token

# Run the setup script
.\scripts\set-github-secrets.ps1 -GitHubToken $githubToken `
  -VercelToken "vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ" `
  -VercelOrgId "team_TUkp3rkTDToUqrh0jYV4VW2k" `
  -VercelProjectId "prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI"
```

## Option 3: Manual via GitHub Website

1. Go to: https://github.com/chausselicita-lang/clube-assinaturas/settings/secrets/actions

2. Click **New repository secret** and add each one:

| Secret Name | Value |
|------------|-------|
| VERCEL_TOKEN | `vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ` |
| VERCEL_ORG_ID | `team_TUkp3rkTDToUqrh0jYV4VW2k` |
| VERCEL_PROJECT_ID | `prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI` |
| NEXT_PUBLIC_SUPABASE_URL | (from your .env.local) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | (from your .env.local) |

## ✅ Verify

After adding secrets, verify they're all set:

```bash
gh secret list --repo chausselicita-lang/clube-assinaturas
```

You should see:
```
NEXT_PUBLIC_SUPABASE_ANON_KEY  Updated Jun 16, 2026, 11:00 AM
NEXT_PUBLIC_SUPABASE_URL       Updated Jun 16, 2026, 11:00 AM
VERCEL_ORG_ID                  Updated Jun 16, 2026, 11:00 AM
VERCEL_PROJECT_ID              Updated Jun 16, 2026, 11:00 AM
VERCEL_TOKEN                   Updated Jun 16, 2026, 11:00 AM
```

## 🚀 Test Deployment

Once secrets are configured, trigger a deployment:

```bash
git push origin master
```

Monitor at: https://github.com/chausselicita-lang/clube-assinaturas/actions

---

**Vercel Credentials Reference:**
- Token: `vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ`
- Org ID: `team_TUkp3rkTDToUqrh0jYV4VW2k`
- Project ID: `prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI`

*Generated: 2026-06-16*
