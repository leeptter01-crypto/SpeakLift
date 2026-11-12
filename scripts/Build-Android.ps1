param(
  [Parameter(Mandatory=$true)][string]$AndroidSdk,
  [string]$GradlePath,
  [string]$ToolStateRoot
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$env:ANDROID_HOME = (Resolve-Path -LiteralPath $AndroidSdk).Path
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
if ($ToolStateRoot) {
  $stateRoot = [IO.Path]::GetFullPath($ToolStateRoot)
  $env:GRADLE_USER_HOME = Join-Path $stateRoot 'gradle-cache'
  $env:ANDROID_USER_HOME = Join-Path $stateRoot 'android-user'
  New-Item -ItemType Directory -Path $env:GRADLE_USER_HOME,$env:ANDROID_USER_HOME -Force | Out-Null
}
if (-not $GradlePath) { $GradlePath = Join-Path $root 'android\gradlew.bat' }
Push-Location (Join-Path $root 'android')
try {
  & $GradlePath --no-daemon assembleDebug testDebugUnitTest lintDebug
  if ($LASTEXITCODE -ne 0) { throw 'Android build or verification failed.' }
  $release = Join-Path $root 'releases'
  New-Item -ItemType Directory -Path $release -Force | Out-Null
  $destination = Join-Path $release 'SpeakLift-0.1.0-preview.apk'
  Copy-Item -LiteralPath 'app\build\outputs\apk\debug\app-debug.apk' -Destination $destination -Force
  $hash = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  SpeakLift-0.1.0-preview.apk" | Set-Content -LiteralPath "$destination.sha256" -Encoding ascii
  Write-Output "APK: $destination"
  Write-Output "SHA256: $hash"
} finally { Pop-Location }
