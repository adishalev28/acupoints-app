# Scans the app point by point and records which points carry a Shon lesson
# video (as opposed to the plain point page).
#
#   powershell -NoProfile -File scan-videos.ps1 -Steps 60 -Out scan.tsv
#
# Detection: on a point page the first section under the header is "Location".
# When a lesson video is present, a player and a "This lesson ..." heading sit
# above it, so "Location" is pushed off the top band and the lesson title shows
# instead. We OCR the band right under the header and look for both signals.
#
# Everything is inlined (screenshot + OCR + click) because spawning a separate
# PowerShell per step costs more than the work itself.

param(
  [int]$Steps = 40,
  [string]$Out = 'scan-videos.tsv',
  [string]$ShotDir = '',
  [int]$SettleMs = 950
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class SV {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, Rt, B; }
}
'@
[void][SV]::SetProcessDPIAware()

# ---- WinRT OCR plumbing (same approach as ocr.ps1) ----
[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]
$null = [System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime')
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
function Await($op, $type) {
  $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
  $t.Wait(-1) | Out-Null
  return $t.Result
}
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'en-US'))
}
if (-not $engine) { Write-Error 'no OCR engine'; exit 1 }

function Get-PhoneWindow {
  $p = Get-Process | Where-Object { $_.ProcessName -eq 'YourPhoneAppProxy' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { return $null }
  $r = New-Object SV+R
  if (-not [SV]::GetWindowRect($p.MainWindowHandle, [ref]$r)) { return $null }
  return [pscustomobject]@{ Handle = $p.MainWindowHandle; X = $r.L; Y = $r.T; W = $r.Rt - $r.L; H = $r.B - $r.T }
}

function Focus-Phone {
  $w = Get-PhoneWindow
  if (-not $w) { return $null }
  [void][SV]::ShowWindow($w.Handle, 5)
  [void][SV]::SetForegroundWindow($w.Handle)
  Start-Sleep -Milliseconds 350
  return Get-PhoneWindow
}

function Grab([int]$cx, [int]$cy, [int]$cw, [int]$ch, [string]$save) {
  $w = Get-PhoneWindow
  if (-not $w) { throw 'phone window gone' }
  $bmp = New-Object System.Drawing.Bitmap $w.W, $w.H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($w.X, $w.Y, 0, 0, $bmp.Size)
  $g.Dispose()
  if ($save) { $bmp.Save($save, [System.Drawing.Imaging.ImageFormat]::Png) }
  $rect = New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)
  $crop = New-Object System.Drawing.Bitmap($cw, $ch)
  $g2 = [System.Drawing.Graphics]::FromImage($crop)
  $g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g2.Dispose(); $bmp.Dispose()
  $tmp = [System.IO.Path]::Combine($env:TEMP, "scanv-$PID.png")
  $crop.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
  $crop.Dispose()
  $file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($tmp)) ([Windows.Storage.StorageFile])
  $st = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $dec = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($st)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $sb = Await ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $res = Await ($engine.RecognizeAsync($sb)) ([Windows.Media.Ocr.OcrResult])
  $st.Dispose()
  return ($res.Lines | ForEach-Object { $_.Text })
}

function Click([int]$x, [int]$y) {
  $w = Get-PhoneWindow
  [void][SV]::SetCursorPos($w.X + $x, $w.Y + $y)
  Start-Sleep -Milliseconds 120
  [SV]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero)
  [SV]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero)
}

$null = Focus-Phone
$rows = New-Object System.Collections.ArrayList
$lastId = ''
$dup = 0

for ($i = 0; $i -lt $Steps; $i++) {
  $shot = ''
  if ($ShotDir) { $shot = Join-Path $ShotDir ("v{0:d3}.png" -f $i) }

  # header band: point id + names
  $head = Grab 0 195 1920 140 ''
  $id = (($head | Select-Object -First 2) -join ' ').Trim()

  # The four tabs are scroll anchors in one page. Jumping to Indications lands
  # near the bottom; a few more wheel steps reach the trailing "Videos" block.
  # Scroll at x=200 on purpose: over the centre diagram the wheel zooms the
  # image instead of scrolling the page.
  Click 1830 167
  Start-Sleep -Milliseconds 400
  Click 1830 167
  Start-Sleep -Milliseconds 500
  for ($s = 0; $s -lt 11; $s++) {
    $w = Get-PhoneWindow
    [void][SV]::SetCursorPos($w.X + 200, $w.Y + 850)
    [SV]::mouse_event(0x0800, 0, 0, 4294966936, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 110
  }
  Start-Sleep -Milliseconds 700

  $body = Grab 0 330 1920 620 $shot
  $hasVideos = $false
  $titles = New-Object System.Collections.ArrayList
  foreach ($ln in $body) {
    if ($ln -match '^\s*Videos\s*$') { $hasVideos = $true; continue }
    if ($hasVideos -and $ln.Trim()) { [void]$titles.Add($ln.Trim()) }
  }
  $mark = if ($hasVideos) { 'VIDEO' } else { '-' }
  $title = ($titles -join ' ')

  $line = "{0}`t{1}`t{2}" -f $id, $mark, $title
  Write-Host ("[{0,3}] {1}" -f $i, $line)
  [void]$rows.Add($line)

  # OCR sometimes renders two different points with the same header text, so a
  # single repeat is not proof we looped. Only three in a row means navigation
  # is stuck or the list wrapped.
  if ($id -eq $lastId) { $dup++ } else { $dup = 0 }
  $lastId = $id
  if ($dup -ge 3) {
    Write-Host "  (same header 3x -> stopping)"
    break
  }

  Click 1868 953
  Start-Sleep -Milliseconds $SettleMs
}

$rows | Set-Content -Path $Out -Encoding UTF8
Write-Host "`nwrote $Out"
