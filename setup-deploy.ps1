# Clube+ Assinaturas - One-Step Deployment Setup
# Run with: powershell -ExecutionPolicy Bypass -File setup-deploy.ps1

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║  🚀 Clube+ Assinaturas - Automated Deployment Setup        ║
║  ────────────────────────────────────────────────────────  ║
║     This script configures GitHub Actions + Vercel deploy  ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check if running from correct directory
if (-not (Test-Path "package.json") -or -not (Test-Path ".github/workflows/deploy.yml")) {
    Write-Host "❌ Error: Please run this script from the clube-assinaturas root directory" -ForegroundColor Red
    exit 1
}

Write-Host "`n[Step 1/4] Checking prerequisites..." -ForegroundColor Yellow

# Check for required tools
$tools = @("git", "gh", "vercel")
$missingTools = @()

foreach ($tool in $tools) {
    try {
        $version = & $tool --version 2>&1 | Select-Object -First 1
        Write-Host "  ✓ $tool" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ $tool not found" -ForegroundColor Red
        $missingTools += $tool
    }
}

if ($missingTools.Count -gt 0) {
    Write-Host "`n❌ Missing required tools: $($missingTools -join ', ')" -ForegroundColor Red
    Write-Host "`nInstall with:" -ForegroundColor Yellow
    Write-Host "  choco install gh vercel" -ForegroundColor Gray
    exit 1
}

Write-Host "`n[Step 2/4] Checking authentication..." -ForegroundColor Yellow

# Check GitHub authentication
try {
    $ghStatus = & gh auth status 2>&1
    if ($ghStatus -like "*not logged*") {
        Write-Host "  ✗ GitHub CLI not authenticated" -ForegroundColor Red
        Write-Host "`n⚠️  REQUIRED: Authenticate with GitHub" -ForegroundColor Yellow
        Write-Host "  Run: gh auth login" -ForegroundColor Cyan
        Write-Host "  Then re-run this script" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "  ✓ GitHub authenticated" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Could not check GitHub status" -ForegroundColor Red
    exit 1
}

# Check Vercel authentication
try {
    $vercelUser = & vercel whoami 2>&1
    if ($vercelUser -like "*error*" -or $vercelUser -like "*not logged*") {
        Write-Host "  ✗ Vercel CLI not authenticated" -ForegroundColor Red
        Write-Host "`n⚠️  REQUIRED: Authenticate with Vercel" -ForegroundColor Yellow
        Write-Host "  Run: vercel login" -ForegroundColor Cyan
        Write-Host "  Then re-run this script" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "  ✓ Vercel authenticated ($vercelUser)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Could not check Vercel status" -ForegroundColor Red
}

Write-Host "`n[Step 3/4] Setting up Vercel project..." -ForegroundColor Yellow

# Link to Vercel (or check if already linked)
if (Test-Path ".vercel/project.json") {
    $vercelProject = Get-Content ".vercel/project.json" | ConvertFrom-Json
    Write-Host "  ✓ Already linked to Vercel" -ForegroundColor Green
    Write-Host "    Project: $($vercelProject.projectId)" -ForegroundColor Gray
} else {
    Write-Host "  Linking to Vercel..." -ForegroundColor Cyan
    try {
        & vercel link --yes 2>&1 | Out-Null
        Start-Sleep -Seconds 2

        if (Test-Path ".vercel/project.json") {
            $vercelProject = Get-Content ".vercel/project.json" | ConvertFrom-Json
            Write-Host "  ✓ Successfully linked" -ForegroundColor Green
            Write-Host "    Project: $($vercelProject.projectId)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ✗ Failed to link Vercel project" -ForegroundColor Red
        Write-Host "  Try manually: vercel link" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n[Step 4/4] Configuring GitHub secrets..." -ForegroundColor Yellow

# Get repository info
$repoUrl = & git -C . remote get-url origin
$repoPath = $repoUrl -replace 'https://github.com/', '' -replace 'git@github.com:', '' -replace '.git$', ''
$owner, $repo = $repoPath -split '/'

Write-Host "  Repository: $owner/$repo" -ForegroundColor Gray

# Get Vercel credentials
$vercelProject = Get-Content ".vercel/project.json" | ConvertFrom-Json
$vercelToken = Read-Host "  Paste your Vercel token (get from https://vercel.com/account/tokens)"

if (-not $vercelToken) {
    Write-Host "  ⚠️  Vercel token is required" -ForegroundColor Yellow
    exit 1
}

# Set secrets
Write-Host "`n  Setting GitHub secrets..." -ForegroundColor Cyan

$secrets = @{
    "VERCEL_TOKEN" = $vercelToken
    "VERCEL_ORG_ID" = $vercelProject.orgId
    "VERCEL_PROJECT_ID" = $vercelProject.projectId
}

# Add Supabase secrets if available
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw

    $urlMatch = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_URL=(.+?)(?:\r?\n|$)')
    if ($urlMatch.Success) {
        $secrets["NEXT_PUBLIC_SUPABASE_URL"] = $urlMatch.Groups[1].Value.Trim()
    }

    $keyMatch = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+?)(?:\r?\n|$)')
    if ($keyMatch.Success) {
        $secrets["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = $keyMatch.Groups[1].Value.Trim()
    }
}

foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    if ($secretValue -and $secretValue -ne "") {
        try {
            Write-Host "    Setting $secretName..." -ForegroundColor Cyan
            $secretValue | & gh secret set $secretName --repo "$owner/$repo"
            Write-Host "    ✓ $secretName" -ForegroundColor Green
        } catch {
            Write-Host "    ✗ Failed to set $secretName" -ForegroundColor Red
        }
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host @"
╔════════════════════════════════════════════════════════════╗
║  ✅ Setup Complete!                                        ║
╚════════════════════════════════════════════════════════════╝

Your deployment is now configured:

📊 Next Steps:
  1. Review secrets: https://github.com/$owner/$repo/settings/secrets/actions
  2. Push to deploy:  git push origin master
  3. Monitor:         https://github.com/$owner/$repo/actions
  4. View live:       https://vercel.com/dashboard

🔗 Links:
  • GitHub Actions:  https://github.com/$owner/$repo/actions
  • Vercel Console:  https://vercel.com/dashboard
  • Project:         https://clube-assinaturas.vercel.app

💡 Tips:
  • Every push to 'master' triggers automatic deployment
  • Check GitHub Actions for build logs
  • View Vercel deployments in the console

"@ -ForegroundColor Green

Write-Host "Ready to deploy? Run:" -ForegroundColor Cyan
Write-Host "  git push origin master`n" -ForegroundColor Gray
