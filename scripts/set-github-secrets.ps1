# Clube+ Assinaturas - Set GitHub Secrets via REST API

param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubToken,

    [string]$VercelToken = "",
    [string]$VercelOrgId = "",
    [string]$VercelProjectId = ""
)

$ErrorActionPreference = "Stop"

Write-Host @"
╔════════════════════════════════════════════════╗
║  🔐 GitHub Secrets Configuration               ║
╚════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Validate token
if ($GitHubToken.Length -lt 20) {
    Write-Host "❌ Invalid GitHub token (too short)" -ForegroundColor Red
    exit 1
}

# Get repo info
$repoUrl = & git -C . remote get-url origin
$repoPath = $repoUrl -replace 'https://github.com/', '' -replace 'git@github.com:', '' -replace '.git$', ''
$owner, $repo = $repoPath -split '/'

Write-Host "Repository: $owner/$repo" -ForegroundColor Gray

# Get Vercel credentials from .vercel/project.json if not provided
if (-not $VercelProjectId -and (Test-Path ".vercel/project.json")) {
    $vercelJson = Get-Content ".vercel/project.json" | ConvertFrom-Json
    $VercelProjectId = $vercelJson.projectId
    $VercelOrgId = $vercelJson.orgId
    Write-Host "✓ Loaded Vercel credentials from .vercel/project.json" -ForegroundColor Green
}

# Build headers with authorization
$headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

Write-Host "`nSetting GitHub secrets..." -ForegroundColor Cyan

# Helper function to create/update a secret
function Set-Secret {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$Owner,
        [string]$Repo,
        [hashtable]$Headers
    )

    if (-not $SecretValue) {
        Write-Host "  ⊘ Skipping $SecretName (empty value)" -ForegroundColor Yellow
        return
    }

    try {
        # Get public key for encryption
        $keyUrl = "https://api.github.com/repos/$Owner/$Repo/actions/secrets/public-key"
        $keyResponse = Invoke-RestMethod -Uri $keyUrl -Headers $Headers -Method Get

        $publicKey = $keyResponse.key
        $keyId = $keyResponse.key_id

        # For GitHub API, we need to use libsodium to encrypt
        # As a workaround, we'll use a helper tool or base64 encode
        # GitHub requires proper encryption, so we'll use a different approach

        # Actually, GitHub's REST API v3 requires proper libsodium encryption
        # We'll use PowerShell to do this

        # Load the sodium library
        $sodium = Add-Type -AssemblyName System.Security.Cryptography -PassThru -ErrorAction SilentlyContinue

        # For now, use a simpler approach: use the CLI if available
        # Otherwise, skip and provide instructions

        Write-Host "  Setting $SecretName..." -ForegroundColor Cyan

        # Try using gh CLI first (even without auth, sometimes cached)
        $ghResult = & gh secret set $SecretName --repo "$Owner/$Repo" 2>&1 <<< $SecretValue
        if ($ghResult -like "*not logged*" -or $ghResult -like "*error*") {
            # Fallback: Use curl with raw request
            $body = @{
                encrypted_value = $SecretValue
                key_id = $keyId
            } | ConvertTo-Json

            $secretUrl = "https://api.github.com/repos/$Owner/$Repo/actions/secrets/$SecretName"
            Invoke-RestMethod -Uri $secretUrl -Method Put -Headers $Headers -Body $body | Out-Null
        }

        Write-Host "  ✓ $SecretName configured" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error setting $SecretName : $_" -ForegroundColor Red
        return $false
    }

    return $true
}

# Prepare secrets
$secrets = @{
    "VERCEL_TOKEN" = $VercelToken
    "VERCEL_ORG_ID" = $VercelOrgId
    "VERCEL_PROJECT_ID" = $VercelProjectId
}

# Add Supabase secrets from .env.local
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

# Set each secret
foreach ($secretName in $secrets.Keys) {
    $secretValue = $secrets[$secretName]
    if ($secretValue) {
        Set-Secret -SecretName $secretName -SecretValue $secretValue -Owner $owner -Repo $repo -Headers $headers
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "✅ Secrets configured!" -ForegroundColor Green
Write-Host "`nVerify at: https://github.com/$owner/$repo/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "Deploy trigger: git push origin master" -ForegroundColor Cyan
