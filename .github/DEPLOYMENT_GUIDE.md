# Deployment Guide

## Quick Setup (2 minutes)

### 1. One-Command Setup

From the project root, run:

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File setup-deploy.ps1
```

Or on macOS/Linux:

```bash
bash scripts/setup-vercel-github.sh
```

### 2. What You Need

- ✅ GitHub account (authenticated with `gh auth login`)
- ✅ Vercel account (authenticated with `vercel login`)
- ✅ Vercel personal token (from https://vercel.com/account/tokens)

### 3. Automatic Deployment

Every time you push to `master`:

```bash
git push origin master
```

The workflow will:
1. Run linting checks
2. Build the Next.js app
3. Deploy to Vercel automatically

## Monitoring

### GitHub Actions
Go to **Actions** tab to see:
- Build status
- Deployment progress
- Error logs (if any)

### Vercel Dashboard
Visit https://vercel.com to see:
- Deployment history
- Preview URLs
- Performance metrics

## Troubleshooting

**Build failed?**
→ Check GitHub Actions logs for error details

**Deployment stuck?**
→ Check Vercel dashboard or re-push to master

**Need to deploy manually?**
→ `vercel --prod` from your terminal

---

**Setup scripts location:**
- `setup-deploy.ps1` — Interactive setup (recommended)
- `scripts/auto-setup.ps1` — Fully automated (requires GITHUB_TOKEN env var)
- `scripts/setup-vercel-github.sh` — Bash version

**More info:** See `DEPLOYMENT.md` for detailed guide
