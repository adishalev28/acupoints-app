param(
  [Parameter(Mandatory)][ValidateSet('click','scroll','move')][string]$Action,
  [int]$X, [int]$Y, [int]$Amount = -3
)

Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Inp {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int dx, int dy, int d, IntPtr e);
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  public const uint LDOWN = 0x02, LUP = 0x04, WHEEL = 0x0800;
}
'@

# חובה — אחרת הקואורדינטות לא תואמות לאלו של הצילום
[void][Inp]::SetProcessDPIAware()

# 🚨 הבאת חלון הטלפון לחזית לפני כל פעולה.
# בלי זה הלחיצה נוחתת על החלון שמעל. קרה בפועל: נפתח תפריט משתמש בחלון Claude.
$ph = Get-Process -Name YourPhoneAppProxy -ErrorAction SilentlyContinue |
      Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $ph) {
  Write-Error "חלון הטלפון לא נמצא. ודא ש-Phone Link פתוח עם שיקוף מסך."
  exit 1
}
[void][Inp]::ShowWindow($ph.MainWindowHandle, 5)
[void][Inp]::SetForegroundWindow($ph.MainWindowHandle)
Start-Sleep -Milliseconds 500

[void][Inp]::SetCursorPos($X, $Y)
Start-Sleep -Milliseconds 120

switch ($Action) {
  'click' {
    [Inp]::mouse_event([Inp]::LDOWN, 0, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 60
    [Inp]::mouse_event([Inp]::LUP, 0, 0, 0, [IntPtr]::Zero)
    Write-Output "click @ $X,$Y"
  }
  'scroll' {
    # Amount שלילי = גלילה למטה. 120 = נקישה אחת
    [Inp]::mouse_event([Inp]::WHEEL, 0, 0, ($Amount * 120), [IntPtr]::Zero)
    Write-Output "scroll $Amount @ $X,$Y"
  }
  'move' { Write-Output "move @ $X,$Y" }
}
Start-Sleep -Milliseconds 400
