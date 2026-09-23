param(
  [Parameter(Mandatory = $true)]
  [string]$GitHubRepoUrl
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath $repoRoot

if (-not (git remote | Select-String -Pattern "^github$" -Quiet)) {
  git remote add github $GitHubRepoUrl
} else {
  git remote set-url github $GitHubRepoUrl
}

git push -u github main
