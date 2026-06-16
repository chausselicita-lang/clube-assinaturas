# ✅ Finalize GitHub Secrets & Deployment

Your Vercel project is ready! Now add the secrets to GitHub in **2 simple steps**:

## Step 1: Add GitHub Secrets

### Option A: GUI (Easiest - 2 minutes)

Visit: https://github.com/chausselicita-lang/clube-assinaturas/settings/secrets/actions

Click **New repository secret** for each:

```
VERCEL_TOKEN = vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ
VERCEL_ORG_ID = team_TUkp3rkTDToUqrh0jYV4VW2k
VERCEL_PROJECT_ID = prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI
```

Then if you have Supabase, get values from your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL = (your value)
NEXT_PUBLIC_SUPABASE_ANON_KEY = (your value)
```

### Option B: CLI (Automated)

```bash
gh auth login

# Then paste these commands:
echo "vcp_1vjnRND4MD5PQF0SYHGUw13c3Lx5eEQFG5i0c5XcMQ" | gh secret set VERCEL_TOKEN --repo chausselicita-lang/clube-assinaturas
echo "team_TUkp3rkTDToUqrh0jYV4VW2k" | gh secret set VERCEL_ORG_ID --repo chausselicita-lang/clube-assinaturas
echo "prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI" | gh secret set VERCEL_PROJECT_ID --repo chausselicita-lang/clube-assinaturas
```

## Step 2: Deploy!

```bash
git push origin master
```

That's it! 🎉

---

## ✅ Verify Everything Works

### Check GitHub Secrets
```bash
gh secret list --repo chausselicita-lang/clube-assinaturas
```

Should show all 3+ secrets.

### Watch Deployment
```
https://github.com/chausselicita-lang/clube-assinaturas/actions
```

You'll see a workflow running:
1. Install dependencies
2. Run linter
3. Build Next.js
4. Deploy to Vercel

### Check Live Site
```
https://vercel.com/dashboard
```

Look for "clube-assinaturas" deployment.

---

## 🚀 Current Status

| Item | Status | Details |
|------|--------|---------|
| Vercel Project | ✅ Linked | `prj_UYEl53CFAYLPU1XUSo1uDtmF5jqI` |
| GitHub Workflow | ✅ Created | `.github/workflows/deploy.yml` |
| GitHub Secrets | ⏳ Pending | You need to add (Step 1) |
| Auto Deploy | ⏳ Ready | Works after Step 1 |

---

## 📋 Commission Fix Status

Also included in this commit:
- ✅ Fixed commission calculation (now uses plan value, not service value)
- ✅ Created comprehensive deployment documentation
- ✅ Configured GitHub Actions for auto-deploy

---

## 💡 What Happens Now

After adding secrets and pushing:

1. **GitHub detects push to master**
2. **GitHub Actions workflow starts**
   - Installs `npm ci`
   - Runs `npm run lint`
   - Runs `npm run build`
3. **Triggers Vercel deployment** (via VERCEL_TOKEN)
4. **App deploys in ~2 minutes**
5. **You get a live URL**

Every future push to `master` = automatic deployment ✨

---

## ❓ Help

**Secrets not working?**
→ Make sure they're exactly as shown (case-sensitive)

**Build failing?**
→ Check GitHub Actions logs for error details

**Deployment slow?**
→ First deploy takes ~5 min, subsequent are ~2 min

---

**Next:** Add secrets, then `git push origin master` 🚀
