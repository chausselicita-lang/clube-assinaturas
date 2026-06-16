# Clube+ Assinaturas - Vercel & GitHub Setup Script for Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 Clube+ Assinaturas - Vercel & GitHub Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Step 1: Check required tools
Write-Host "`n1. Checking required tools..." -ForegroundColor Cyan
$tools = @("gh", "vercel", "git")
foreach ($tool in $tools) {
    try {
        $version = & $tool --version 2>&1 | Select-Object -First 1
        Write-Host "✓ $tool : $version" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $tool not found" -ForegroundColor Yellow
    }
}

# Step 2: Check GitHub auth
Write-Host "`n2. Checking GitHub authentication..." -ForegroundColor Cyan
try {
    $ghStatus = & gh auth status 2>&1
    $githubUser = & gh api user --jq '.login' 2>&1
    Write-Host "✓ Logged in as: $githubUser" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not authenticated with GitHub" -ForegroundColor Yellow
    Write-Host "Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Step 3: Get repository info
$repoUrl = & git -C . remote get-url origin
$repoPath = $repoUrl -replace 'https://github.com/', '' -replace '.git$', ''
$repoParts = $repoPath -split '/'
$githubOrg = $repoParts[0]
$githubRepo = $repoParts[1]

Write-Host "✓ Repository: $githubOrg/$githubRepo" -ForegroundColor Green

# Step 4: Check Vercel auth
Write-Host "`n3. Checking Vercel authentication..." -ForegroundColor Cyan
try {
    $vercelUser = & vercel whoami 2>&1
    Write-Host "✓ Vercel user: $vercelUser" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not authenticated with Vercel" -ForegroundColor Yellow
    Write-Host "Run: vercel login" -ForegroundColor Yellow
    exit 1
}

# Step 5: Create/Link Vercel project
Write-Host "`n4. Setting up Vercel project..." -ForegroundColor Cyan

$vercelJsonPath = ".vercel/project.json"
if (-not (Test-Path $vercelJsonPath)) {
    Write-Host "Creating new Vercel project..."
    & vercel --yes --confirm 2>&1 | Select-Object -First 20
    Start-Sleep -Seconds 2
} else {
    Write-Host "✓ Vercel project already linked" -ForegroundColor Green
}

# Extract credentials from .vercel/project.json
if (Test-Path $vercelJsonPath) {
    $vercelJson = Get-Content $vercelJsonPath | ConvertFrom-Json
    $vercelOrgId = $vercelJson.orgId
    $vercelProjectId = $vercelJson.projectId
    Write-Host "✓ Project ID: $vercelProjectId" -ForegroundColor Green
    Write-Host "✓ Org ID: $vercelOrgId" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not find project credentials" -ForegroundColor Yellow
    Write-Host "Please visit: https://vercel.com/dashboard" -ForegroundColor Yellow
    exit 1
}

# Step 6: Get Vercel token
Write-Host "`n5. Getting Vercel token..." -ForegroundColor Cyan

if ($env:VERCEL_TOKEN) {
    Write-Host "✓ VERCEL_TOKEN already set" -ForegroundColor Green
    $vercelToken = $env:VERCEL_TOKEN
} else {
    # Try to get token from Vercel config
    $vercelConfigPath = "$env:APPDATA\Roaming\.vercelrc.json"
    if (Test-Path $vercelConfigPath) {
        $vercelConfig = Get-Content $vercelConfigPath | ConvertFrom-Json
        $vercelToken = $vercelConfig.token
        Write-Host "✓ Found token in Vercel config" -ForegroundColor Green
    } else {
        Write-Host "⚠️  VERCEL_TOKEN not found" -ForegroundColor Yellow
        Write-Host "Create one at: https://vercel.com/account/tokens" -ForegroundColor Yellow
        Write-Host "Then set it: `$env:VERCEL_TOKEN = 'your-token'" -ForegroundColor Yellow

        # For now, we'll try to continue with environment-based token
        $vercelToken = ""
    }
}

# Step 7: Set GitHub secrets
Write-Host "`n6. Setting GitHub secrets..." -ForegroundColor Cyan

$secrets = @(
    @{ Name = "VERCEL_TOKEN"; Value = $vercelToken }
    @{ Name = "VERCEL_ORG_ID"; Value = $vercelOrgId }
    @{ Name = "VERCEL_PROJECT_ID"; Value = $vercelProjectId }
)

# Add Supabase secrets if .env.local exists
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw

    $supabaseUrl = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_URL=(.+?)(?:\r?\n|$)').Groups[1].Value.Trim()
    $supabaseKey = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+?)(?:\r?\n|$)').Groups[1].Value.Trim()

    if ($supabaseUrl -and $supabaseKey) {
        $secrets += @(
            @{ Name = "NEXT_PUBLIC_SUPABASE_URL"; Value = $supabaseUrl }
            @{ Name = "NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value = $supabaseKey }
        )
    }
}

foreach ($secret in $secrets) {
    if ($secret.Value) {
        Write-Host "Setting $($secret.Name)..." -ForegroundColor Cyan
        $secret.Value | & gh secret set $secret.Name --repo "$githubOrg/$githubRepo"
        Write-Host "✓ $($secret.Name) set" -ForegroundColor Green
    }
}

# Step 8: Verify secrets
Write-Host "`n7. Verifying secrets..." -ForegroundColor Cyan
& gh secret list --repo "$githubOrg/$githubRepo"

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "GitHub Actions will now deploy automatically on push to master" -ForegroundColor Cyan
Write-Host "Monitor deployments at: https://github.com/$githubOrg/$githubRepo/actions" -ForegroundColor Cyan
Write-Host "View Vercel dashboard at: https://vercel.com" -ForegroundColor Cyan
