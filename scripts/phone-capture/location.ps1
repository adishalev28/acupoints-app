# Capture the Location tab of the point currently shown: Location + Needling
# + Reaction Area come back in one screenshot as clean text.
#
# This is the missing half of the pipeline. capture-batch.ps1 reads only the
# Indications tab, so newly discovered points had indications but no location
# and could not be added to the database.
#
# The tab is clicked TWICE: the first click after switching windows is
# swallowed by window activation.
#
# NOTE: keep this file ASCII-only. PowerShell mis-decodes Hebrew here.
#
#   powershell -NoProfile -File location.ps1 -Out shot.png
param(
  [string]$Out = 'loc.png'
)

$here = Split-Path -Parent $MyInvocation.MyCommand.Path

& powershell -NoProfile -File "$here\input.ps1" -Action click -X 68 -Y 167 | Out-Null
Start-Sleep -Milliseconds 600
& powershell -NoProfile -File "$here\input.ps1" -Action click -X 68 -Y 167 | Out-Null
Start-Sleep -Milliseconds 900

& powershell -NoProfile -File "$here\phone.ps1" -Max -Out $Out | Out-Null
& powershell -NoProfile -File "$here\ocr.ps1" -Path $Out -Crop "0,195,1920,760"
