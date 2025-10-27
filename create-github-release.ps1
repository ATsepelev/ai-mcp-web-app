# Script to create GitHub Release via API
# Usage: .\create-github-release.ps1

$ErrorActionPreference = "Stop"

# Configuration
$owner = "chatrium"
$repo = "widget"
$tag = "v3.0.0"
$releaseName = "v3.0.0: Rebranding to Chatrium Widget + Ecosystem Launch"

# Read release notes
$releaseNotes = Get-Content -Path "RELEASE_NOTES_v3.0.0.md" -Raw

# GitHub API URL
$apiUrl = "https://api.github.com/repos/$owner/$repo/releases"

Write-Host "Creating GitHub Release for $tag..." -ForegroundColor Cyan

# Prompt for GitHub token if not set in environment
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "GitHub token not found in GITHUB_TOKEN environment variable." -ForegroundColor Yellow
    Write-Host "Please enter your GitHub Personal Access Token (with 'repo' scope):" -ForegroundColor Yellow
    Write-Host "Create one at: https://github.com/settings/tokens/new" -ForegroundColor Yellow
    $secureToken = Read-Host -AsSecureString "Token"
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
    $token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# Create release payload
$payload = @{
    tag_name = $tag
    name = $releaseName
    body = $releaseNotes
    draft = $false
    prerelease = $false
} | ConvertTo-Json -Depth 10

# Set headers
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

try {
    # Create release
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $payload -ContentType "application/json"
    
    Write-Host "`n✅ Release created successfully!" -ForegroundColor Green
    Write-Host "Release URL: $($response.html_url)" -ForegroundColor Green
    Write-Host "`nRelease Details:" -ForegroundColor Cyan
    Write-Host "  Tag: $($response.tag_name)"
    Write-Host "  Name: $($response.name)"
    Write-Host "  Published: $($response.published_at)"
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 422) {
        Write-Host "`n⚠️  Release already exists for tag $tag" -ForegroundColor Yellow
        Write-Host "View it at: https://github.com/$owner/$repo/releases/tag/$tag" -ForegroundColor Yellow
    } else {
        Write-Host "`n❌ Error creating release:" -ForegroundColor Red
        Write-Host "Status Code: $statusCode"
        Write-Host "Error: $errorMessage"
    }
    exit 1
}

