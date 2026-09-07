# Walks points and dumps the full text around the trailing "Videos" block:
# the lesson title, the duration badge, and the written summary that sits
# under the player (Overview / Key Takeaways).
#
#   powershell -NoProfile -File grab-lessons.ps1 -Steps 31 -Out zone22.txt
#
# Unlike scan-videos.ps1 this does not try to *decide* whether a video exists -
# Adi already mapped that by hand. It just captures everything at the bottom of
# each page so the lesson text can be read out of the transcript afterwards.

param(
  [int]$Steps = 30,
  [string]$Out = 'lessons.txt',
  [int]$SettleMs = 900
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class GL {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, Rt, B; }
}
'@
[void][GL]::SetProcessDPIAware()

[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]
$null = [System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime')
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
function Await($op, $type) { $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; return $t.Result }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'en-US')) }

function Win {
  $p = Get-Process | Where-Object { $_.ProcessName -eq 'YourPhoneAppProxy' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { return $null }
  $r = New-Object GL+R
  [void][GL]::GetWindowRect($p.MainWindowHandle, [ref]$r)
  return [pscustomobject]@{ H = $p.MainWindowHandle; X = $r.L; Y = $r.T; W = $r.Rt - $r.L; Ht = $r.B - $r.T }
}

function Grab([int]$cy, [int]$ch) {
  $w = Win
  if (-not $w) { throw 'phone window gone' }
  $bmp = New-Object System.Drawing.Bitmap $w.W, $w.Ht
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($w.X, $w.Y, 0, 0, $bmp.Size); $g.Dispose()
  $crop = New-Object System.Drawing.Bitmap($w.W, $ch)
  $g2 = [System.Drawing.Graphics]::FromImage($crop)
  $g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $w.W, $ch)), (New-Object System.Drawing.Rectangle(0, $cy, $w.W, $ch)), [System.Drawing.GraphicsUnit]::Pixel)
  $g2.Dispose(); $bmp.Dispose()
  $tmp = [System.IO.Path]::Combine($env:TEMP, "gl-$PID.png")
  $crop.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png); $crop.Dispose()
  $f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($tmp)) ([Windows.Storage.StorageFile])
  $st = Await ($f.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $d = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($st)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $sb = Await ($d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $res = Await ($engine.RecognizeAsync($sb)) ([Windows.Media.Ocr.OcrResult])
  $st.Dispose()
  return ($res.Lines | ForEach-Object { $_.Text })
}

function Click([int]$x, [int]$y) {
  $w = Win
  [void][GL]::SetCursorPos($w.X + $x, $w.Y + $y)
  Start-Sleep -Milliseconds 110
  [GL]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero)
  [GL]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero)
}

function Wheel([int]$times) {
  for ($s = 0; $s -lt $times; $s++) {
    $w = Win
    [void][GL]::SetCursorPos($w.X + 200, $w.Y + 850)
    [GL]::mouse_event(0x0800, 0, 0, 4294966936, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 110
  }
}

$w = Win
[void][GL]::ShowWindow($w.H, 5); [void][GL]::SetForegroundWindow($w.H); Start-Sleep -Milliseconds 400

$lines = New-Object System.Collections.ArrayList
for ($i = 0; $i -lt $Steps; $i++) {
  $head = (Grab 195 140) -join ' | '
  Click 1830 167; Start-Sleep -Milliseconds 350
  Click 1830 167; Start-Sleep -Milliseconds 450
  Wheel 13
  Start-Sleep -Milliseconds 500
  $a = Grab 195 745
  Wheel 6
  Start-Sleep -Milliseconds 450
  $b = Grab 330 610

  [void]$lines.Add('===== ' + $head)
  foreach ($l in $a) { if ($l.Trim()) { [void]$lines.Add($l.Trim()) } }
  [void]$lines.Add('----- (scrolled)')
  foreach ($l in $b) { if ($l.Trim()) { [void]$lines.Add($l.Trim()) } }

  Write-Host ("[{0,2}] {1}" -f $i, $head)
  Click 1868 953
  Start-Sleep -Milliseconds $SettleMs
}

$lines | Set-Content -Path $Out -Encoding UTF8
Write-Host "`nwrote $Out"
