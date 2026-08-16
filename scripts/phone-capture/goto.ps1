# Verified navigation to a point: clicks "next" and reads the header after
# every step.
#
# Why not count clicks: the in-app arrows are not symmetric, and the first
# click after switching windows is swallowed by window activation. Blind
# navigation lands on the wrong point, and the capture then looks fine while
# belonging to a different point entirely.
#
# NOTE: keep this file ASCII-only. PowerShell mis-decodes Hebrew here and
# fails to parse.
#
#   powershell -NoProfile -File goto.ps1 -Target "Feng" -MaxSteps 40
# Match $Target against the ENGLISH name when possible ("Shoulder Peak"):
# OCR renders pinyin diacritics as '?', so "Feng" never matches "F?ng".
param(
  [Parameter(Mandatory = $true)][string]$Target,
  [int]$MaxSteps = 40,
  [switch]$Back,
  [string]$Probe = 'goto-probe.png'
)
$navX = if ($Back) { 45 } else { 1868 }

$here = Split-Path -Parent $MyInvocation.MyCommand.Path

function Read-Header {
  & powershell -NoProfile -File "$here\phone.ps1" -Max -Out $Probe | Out-Null
  $t = & powershell -NoProfile -File "$here\ocr.ps1" -Path $Probe -Crop "0,195,1920,120"
  return ($t -join ' ').Trim()
}

$h = Read-Header
Write-Host "start: $h"
if ($h -match $Target) { Write-Host "already there."; exit 0 }

for ($i = 1; $i -le $MaxSteps; $i++) {
  & powershell -NoProfile -File "$here\input.ps1" -Action click -X $navX -Y 953 | Out-Null
  Start-Sleep -Milliseconds 700
  $h = Read-Header
  Write-Host ("  [{0,2}] {1}" -f $i, $h)
  if ($h -match $Target) {
    Write-Host "FOUND: $h"
    exit 0
  }
}

Write-Host "NOT FOUND after $MaxSteps steps. stopped at: $h"
exit 1
