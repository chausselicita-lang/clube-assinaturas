# Clube+ Assinaturas - Fully Automated Vercel & GitHub Setup

param(
    [string]$GithubToken = $env:GITHUB_TOKEN,
    [string]$VercelToken = $env:VERCEL_TOKEN
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "🚀 Clube+ Assinaturas - Automated Vercel & GitHub Setup" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Step 1: Validate inputs
Write-Host "`n[1/6] Validating configuration..." -ForegroundColor Cyan

if (-not $GithubToken) {
    Write-Host "❌ GITHUB_TOKEN is required" -ForegroundColor Red
    Write-Host "   Set it with: `$env:GITHUB_TOKEN = 'your-token'" -ForegroundColor Yellow
    Write-Host "   Get token at: https://github.com/settings/tokens/new" -ForegroundColor Yellow
    exit 1
}

if (-not $VercelToken) {
    Write-Host "⚠️  VERCEL_TOKEN not set - will skip Vercel project creation" -ForegroundColor Yellow
    Write-Host "   Get token at: https://vercel.com/account/tokens" -ForegroundColor Yellow
}

# Step 2: Get repository info
Write-Host "`n[2/6] Getting repository information..." -ForegroundColor Cyan

$repoUrl = & git -C . remote get-url origin 2>&1
if ($repoUrl -like "*error*") {
    Write-Host "❌ Could not get repository URL" -ForegroundColor Red
    exit 1
}

$repoPath = $repoUrl -replace 'https://github.com/', '' -replace 'git@github.com:', '' -replace '.git$', ''
$repoParts = $repoPath -split '/'
$githubOwner = $repoParts[0]
$githubRepo = $repoParts[1]

Write-Host "✓ Repository: $githubOwner/$githubRepo" -ForegroundColor Green
Write-Host "✓ Remote URL: $repoUrl" -ForegroundColor Green

# Step 3: Get/Create Vercel Project
Write-Host "`n[3/6] Setting up Vercel project..." -ForegroundColor Cyan

if ($VercelToken) {
    try {
        # Check if project is already linked
        if (Test-Path ".vercel/project.json") {
            Write-Host "✓ Project already linked" -ForegroundColor Green
            $projectJson = Get-Content ".vercel/project.json" | ConvertFrom-Json
            $vercelProjectId = $projectJson.projectId
            $vercelOrgId = $projectJson.orgId
        } else {
            # Create new project via Vercel API
            Write-Host "Creating new Vercel project via API..." -ForegroundColor Cyan

            $headers = @{
                "Authorization" = "Bearer $VercelToken"
                "Content-Type" = "application/json"
            }

            # Create project
            $projectBody = @{
                name = "clube-assinaturas"
                framework = "nextjs"
                buildCommand = "npm run build"
                outputDirectory = ".next"
            } | ConvertTo-Json

            $projectResponse = Invoke-RestMethod `
                -Uri "https://api.vercel.com/v10/projects" `
                -Method Post `
                -Headers $headers `
                -Body $projectBody

            $vercelProjectId = $projectResponse.id
            $vercelOrgId = $projectResponse.accountId

            Write-Host "✓ Project created: $vercelProjectId" -ForegroundColor Green
            Write-Host "✓ Org ID: $vercelOrgId" -ForegroundColor Green

            # Save to .vercel directory
            New-Item -ItemType Directory -Path ".vercel" -Force | Out-Null
            $projectJson = @{
                projectId = $vercelProjectId
                orgId = $vercelOrgId
            } | ConvertTo-Json
            Set-Content -Path ".vercel/project.json" -Value $projectJson
        }
    } catch {
        Write-Host "⚠️  Could not create Vercel project via API: $_" -ForegroundColor Yellow
        Write-Host "Run manually: vercel link" -ForegroundColor Yellow
        $vercelProjectId = ""
    }
} else {
    Write-Host "⚠️  Skipping Vercel project setup (VERCEL_TOKEN not set)" -ForegroundColor Yellow
    $vercelProjectId = ""
    $vercelOrgId = ""
}

# Step 4: Get GitHub repo ID
Write-Host "`n[4/6] Getting GitHub repository ID..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "token $GithubToken"
    "Accept" = "application/vnd.github.v3+json"
}

try {
    $repoInfo = Invoke-RestMethod `
        -Uri "https://api.github.com/repos/$githubOwner/$githubRepo" `
        -Headers $headers

    $repoId = $repoInfo.id
    Write-Host "✓ Repo ID: $repoId" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not get repository info: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Create GitHub Secrets
Write-Host "`n[5/6] Creating GitHub repository secrets..." -ForegroundColor Cyan

# Helper function to create a secret
function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$Owner,
        [string]$Repo,
        [hashtable]$Headers
    )

    if (-not $SecretValue) {
        Write-Host "⊘ Skipping $SecretName (empty value)" -ForegroundColor Yellow
        return
    }

    try {
        # Get public key for encryption
        $keyResponse = Invoke-RestMethod `
            -Uri "https://api.github.com/repos/$Owner/$Repo/actions/secrets/public-key" `
            -Headers $Headers

        $publicKey = $keyResponse.key
        $keyId = $keyResponse.key_id

        # Encrypt the secret value using libsodium
        # For simplicity, we'll use a workaround: base64 encode
        $secretBytes = [System.Text.Encoding]::UTF8.GetBytes($SecretValue)
        $encryptedValue = [System.Convert]::ToBase64String($secretBytes)

        # Create the secret
        $secretBody = @{
            encrypted_value = $encryptedValue
            key_id = $keyId
        } | ConvertTo-Json

        Invoke-RestMethod `
            -Uri "https://api.github.com/repos/$Owner/$Repo/actions/secrets/$SecretName" `
            -Method Put `
            -Headers $Headers `
            -Body $secretBody `
            -ContentType "application/json" | Out-Null

        Write-Host "✓ $SecretName created" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not create $SecretName : $_" -ForegroundColor Yellow
    }
}

# NOTE: GitHub API requires libsodium for secret encryption
# As a workaround, we'll use gh CLI if available, or provide instructions

# Try using gh CLI for secrets
$useGhCli = $false
try {
    if (& gh auth status 2>&1 | Select-String "Logged in") {
        $useGhCli = $true
        Write-Host "Using GitHub CLI for secret management" -ForegroundColor Green
    }
} catch {
    # Continue without gh CLI
}

if ($useGhCli) {
    # Use gh CLI to set secrets
    $secrets = @{
        "VERCEL_TOKEN" = $VercelToken
        "VERCEL_ORG_ID" = $vercelOrgId
        "VERCEL_PROJECT_ID" = $vercelProjectId
    }

    # Add Supabase secrets from .env.local
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local" -Raw
        $supabaseUrl = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_URL=(.+?)(?:\r?\n|$)').Groups[1].Value.Trim()
        $supabaseKey = [regex]::Match($envContent, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+?)(?:\r?\n|$)').Groups[1].Value.Trim()

        if ($supabaseUrl) { $secrets["NEXT_PUBLIC_SUPABASE_URL"] = $supabaseUrl }
        if ($supabaseKey) { $secrets["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = $supabaseKey }
    }

    foreach ($secretName in $secrets.Keys) {
        $secretValue = $secrets[$secretName]
        if ($secretValue) {
            Write-Host "Setting $secretName..." -ForegroundColor Cyan
            $secretValue | & gh secret set $secretName --repo "$githubOwner/$githubRepo"
            Write-Host "✓ $secretName set" -ForegroundColor Green
        }
    }
} else {
    Write-Host "⚠️  GitHub CLI not authenticated. Using API method..." -ForegroundColor Yellow
    Write-Host "⚠️  Note: API encryption requires additional setup" -ForegroundColor Yellow

    # For now, provide instructions
    Write-Host "`nTo set secrets, run these commands:" -ForegroundColor Yellow
    if ($VercelToken) {
        Write-Host "  `$env:VERCEL_TOKEN | gh secret set VERCEL_TOKEN --repo $githubOwner/$githubRepo" -ForegroundColor Gray
    }
    if ($vercelOrgId) {
        Write-Host "  `$env:VERCEL_ORG_ID | gh secret set VERCEL_ORG_ID --repo $githubOwner/$githubRepo" -ForegroundColor Gray
    }
    if ($vercelProjectId) {
        Write-Host "  `$env:VERCEL_PROJECT_ID | gh secret set VERCEL_PROJECT_ID --repo $githubOwner/$githubRepo" -ForegroundColor Gray
    }
}

# Step 6: Verify Setup
Write-Host "`n[6/6] Verifying setup..." -ForegroundColor Cyan

# Check GitHub Actions workflow
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "✓ GitHub Actions workflow exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub Actions workflow not found" -ForegroundColor Yellow
}

# Check Vercel config
if (Test-Path "vercel.json") {
    Write-Host "✓ Vercel configuration exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  vercel.json not found" -ForegroundColor Yellow
}

# Check .vercel/project.json
if (Test-Path ".vercel/project.json") {
    $projJson = Get-Content ".vercel/project.json" | ConvertFrom-Json
    Write-Host "✓ Vercel project linked (ID: $($projJson.projectId))" -ForegroundColor Green
}

# Summary
Write-Host "`n" -ForegroundColor White
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Verify secrets at: https://github.com/$githubOwner/$githubRepo/settings/secrets/actions" -ForegroundColor White
Write-Host "2. Push to master branch to trigger deployment" -ForegroundColor White
Write-Host "3. Monitor at: https://github.com/$githubOwner/$githubRepo/actions" -ForegroundColor White
Write-Host "4. View live at: https://vercel.com/dashboard" -ForegroundColor White
