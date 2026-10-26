param(
  [string]$GitHubRepoUrl = "https://github.com/leeptter01-crypto/SpeakLift.git"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath $repoRoot

if (-not (git remote | Select-String -Pattern "^github$" -Quiet)) {
  git remote add github $GitHubRepoUrl
} else {
  git remote set-url github $GitHubRepoUrl
}

if ($LASTEXITCODE -ne 0) {
  throw "Could not configure the GitHub remote. No code was pushed."
}

git push github main
if ($LASTEXITCODE -ne 0) {
  throw "GitHub sync failed. Check authentication and compare branch history; do not force-push."
}
