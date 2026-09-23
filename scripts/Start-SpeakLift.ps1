$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appRoot = Split-Path -Parent $scriptDir
$distDir = Join-Path $appRoot "dist"

if (-not (Test-Path -LiteralPath $distDir)) {
  throw "Cannot find SpeakLift dist directory: $distDir"
}

function Test-PortFree {
  param([int]$Port)
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) {
      $listener.Stop()
    }
  }
}

$port = 4173
while ($port -lt 4190 -and -not (Test-PortFree -Port $port)) {
  $port += 1
}

if ($port -ge 4190) {
  throw "No free local port found for SpeakLift."
}

$python = Get-Command py -ErrorAction SilentlyContinue
if ($python) {
  $serverArgs = @("-3", "-m", "http.server", "$port", "--bind", "127.0.0.1")
  $serverExe = $python.Source
} else {
  $python = Get-Command python -ErrorAction SilentlyContinue
  if (-not $python) {
    throw "Python is required to start the local SpeakLift app server."
  }
  $serverArgs = @("-m", "http.server", "$port", "--bind", "127.0.0.1")
  $serverExe = $python.Source
}

Start-Process -FilePath $serverExe -ArgumentList $serverArgs -WorkingDirectory $distDir -WindowStyle Hidden | Out-Null
Start-Sleep -Milliseconds 700

$url = "http://127.0.0.1:$port/"
$browserCandidates = @(
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
)

$browser = $browserCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if ($browser) {
  Start-Process -FilePath $browser -ArgumentList @("--app=$url")
} else {
  Start-Process $url
}
