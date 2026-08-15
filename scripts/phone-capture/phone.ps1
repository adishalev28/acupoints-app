param([string]$Out = "", [switch]$List, [switch]$NoFocus, [switch]$Max)

Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class W2 {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out R r);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [StructLayout(LayoutKind.Sequential)] public struct R { public int L, T, Rt, B; }
}
'@

# בלי זה GetWindowRect ו-CopyFromScreen עובדים במערכות צירים שונות
[void][W2]::SetProcessDPIAware()

$wins = @()
foreach ($p in Get-Process | Where-Object { $_.MainWindowHandle -ne 0 }) {
  $r = New-Object W2+R
  $ok = [W2]::GetWindowRect($p.MainWindowHandle, [ref]$r)
  if (-not $ok) { continue }
  $w = $r.Rt - $r.L
  $h = $r.B - $r.T
  if ($w -lt 80 -or $h -lt 80) { continue }
  $wins += [pscustomobject]@{
    Proc = $p.ProcessName; Title = $p.MainWindowTitle; Handle = $p.MainWindowHandle
    X = $r.L; Y = $r.T; W = $w; H = $h; Ratio = [math]::Round($h / $w, 2)
  }
}

if ($List) {
  $wins | Sort-Object Ratio -Descending | Format-Table Proc, W, H, Ratio, X, Y, Title -AutoSize | Out-String -Width 200
  return
}

# לפי שם התהליך בלבד. היוריסטיקה של יחס גובה-רוחב תפסה את חלון Claude בטעות.
$ph = $wins | Where-Object { $_.Proc -eq 'YourPhoneAppProxy' } | Select-Object -First 1
if (-not $ph) { Write-Output "NOTFOUND"; return }

# בלי הבאה לחזית, הצילום יתפוס את החלון שמכסה את הטלפון.
# SW_SHOW (5) ולא SW_RESTORE (9) — 9 מבטל מיקסום ומקטין את החלון.
if (-not $NoFocus) {
  [void][W2]::ShowWindow($ph.Handle, $(if ($Max) { 3 } else { 5 }))   # 3=MAXIMIZE 5=SHOW
  [void][W2]::SetForegroundWindow($ph.Handle)
  Start-Sleep -Milliseconds 700
  # המלבן נמדד מחדש — הוא יכול להשתנות בעקבות ההבאה לחזית
  $r2 = New-Object W2+R
  if ([W2]::GetWindowRect($ph.Handle, [ref]$r2)) {
    $ph.X = $r2.L; $ph.Y = $r2.T
    $ph.W = $r2.Rt - $r2.L; $ph.H = $r2.B - $r2.T
  }
}

if ($Out) {
  $bmp = New-Object System.Drawing.Bitmap $ph.W, $ph.H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.CopyFromScreen($ph.X, $ph.Y, 0, 0, $bmp.Size)
  $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
Write-Output "$($ph.X) $($ph.Y) $($ph.W) $($ph.H) $($ph.Proc)"
