# 🚀 Quick Deploy Setup

## TL;DR - 5 Minutes to Automated Deployment

```powershell
# 1. Authenticate (one-time)
gh auth login
vercel login

# 2. Run setup script
.\setup-deploy.ps1

# 3. Done! Now every git push deploys automatically
git push origin master
```

---

## What Just Happened?

✅ **GitHub Actions Workflow** configured  
✅ **Vercel Project** linked  
✅ **GitHub Secrets** configured (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)  
✅ **Automatic Deployment** enabled  

---

## Deploy Workflow

```
Your Code
    ↓
git push origin master
    ↓
GitHub Actions triggered
    ↓
✓ npm ci (install deps)
✓ npm run lint (check code)
✓ npm run build (build app)
    ↓
Deploy to Vercel
    ↓
Live on https://clube-assinaturas.vercel.app
```

---

## Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow definition |
| `vercel.json` | Vercel build configuration |
| `.vercel/project.json` | Project ID & credentials |
| `setup-deploy.ps1` | Interactive setup script |

---

## Monitor Deployments

**GitHub Actions**
→ https://github.com/chausselicita-lang/clube-assinaturas/actions

**Vercel Dashboard**
→ https://vercel.com/dashboard

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Build failed" | Check GitHub Actions logs for error |
| "Deploy pending" | Wait a few minutes or check Vercel dashboard |
| "Secret not found" | Re-run `setup-deploy.ps1` or manually set secrets |
| "Can't push to GitHub" | Run `gh auth login` |

---

## Next Steps

1. ✅ Setup complete
2. 📤 Push to trigger deployment: `git push origin master`
3. 📊 Monitor: GitHub Actions or Vercel Dashboard
4. 🎉 Your app is live!

---

## Environment Variables

These are automatically set from `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

**Questions?** See `DEPLOYMENT.md` for detailed guide.
