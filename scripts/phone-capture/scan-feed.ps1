# Walks the Home feed of the app, which is a scrollable list of video cards,
# and dumps the OCR text of every screenful. This is far cheaper and far more
# reliable than visiting all ~320 point pages: the feed IS the video library.
#
#   powershell -NoProfile -File scan-feed.ps1 -Out feed.txt
#
# Scroll at x=30 on purpose - over a card image the wheel zooms the picture.

param(
  [int]$MaxScrolls = 60,
  [string]$Out = 'feed.txt'
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class FD {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, Rt, B; }
}
'@
[void][FD]::SetProcessDPIAware()

[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]
$null = [System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime')
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
function Await($op, $type) {
  $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; return $t.Result
}
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) { $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'en-US')) }

function Win {
  $p = Get-Process | Where-Object { $_.ProcessName -eq 'YourPhoneAppProxy' -and $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  if (-not $p) { return $null }
  $r = New-Object FD+R
  [void][FD]::GetWindowRect($p.MainWindowHandle, [ref]$r)
  return [pscustomobject]@{ H = $p.MainWindowHandle; X = $r.L; Y = $r.T; W = $r.Rt - $r.L; Ht = $r.B - $r.T }
}

function Shot {
  $w = Win
  $bmp = New-Object System.Drawing.Bitmap $w.W, $w.Ht
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($w.X, $w.Y, 0, 0, $bmp.Size); $g.Dispose()
  $sum = 0
  for ($y = 200; $y -lt 900; $y += 10) { for ($x = 40; $x -lt 1900; $x += 10) { $sum = ($sum + $bmp.GetPixel($x, $y).ToArgb()) % 2147483647 } }
  $tmp = [System.IO.Path]::Combine($env:TEMP, "feed-$PID.png")
  $rect = New-Object System.Drawing.Rectangle(0, 150, $w.W, 830)
  $crop = New-Object System.Drawing.Bitmap($w.W, 830)
  $g2 = [System.Drawing.Graphics]::FromImage($crop)
  $g2.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $w.W, 830)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g2.Dispose(); $bmp.Dispose()
  $crop.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png); $crop.Dispose()
  $f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($tmp)) ([Windows.Storage.StorageFile])
  $st = Await ($f.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $d = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($st)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $sb = Await ($d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  $res = Await ($engine.RecognizeAsync($sb)) ([Windows.Media.Ocr.OcrResult])
  $st.Dispose()
  return [pscustomobject]@{ Sig = $sum; Lines = ($res.Lines | ForEach-Object { $_.Text }) }
}

$w = Win
[void][FD]::ShowWindow($w.H, 5); [void][FD]::SetForegroundWindow($w.H); Start-Sleep -Milliseconds 500

$all = New-Object System.Collections.ArrayList
$prev = ''
$stable = 0
for ($i = 0; $i -lt $MaxScrolls; $i++) {
  $s = Shot
  foreach ($l in $s.Lines) { if ($l.Trim()) { [void]$all.Add($l.Trim()) } }
  Write-Host ("[{0,2}] {1}" -f $i, (($s.Lines | Where-Object { $_ -match ':\d\d|Points|\d\d\.\d\d' }) -join ' | '))
  if ($s.Sig -eq $prev) { $stable++; if ($stable -ge 2) { Write-Host 'bottom'; break } } else { $stable = 0 }
  $prev = $s.Sig
  $w = Win
  [void][FD]::SetCursorPos($w.X + 30, $w.Y + 600)
  [FD]::mouse_event(0x0800, 0, 0, 4294966836, [IntPtr]::Zero)   # -460
  Start-Sleep -Milliseconds 450
}

$all | Set-Content -Path $Out -Encoding UTF8
Write-Host "`nwrote $Out ($($all.Count) lines)"
