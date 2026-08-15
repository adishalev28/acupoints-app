param(
  [Parameter(Mandatory)][ValidateSet('click','scroll','move','type','keys','drag')][string]$Action,
  [int]$X, [int]$Y, [int]$Amount = -3, [string]$Text = '',
  [int]$ToX = -1, [int]$ToY = -1
)

Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Inp {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, int dx, int dy, int d, IntPtr e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint f, IntPtr e);
  [DllImport("user32.dll")] public static extern short VkKeyScan(char c);
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
  'drag' {
    # מחוות החלקה. חלק ממסכי האפליקציה (Explore, בורר האזורים)
    # מתעלמים מגלגלת העכבר ומגיבים רק לגרירה.
    [Inp]::mouse_event([Inp]::LDOWN, 0, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 120
    $steps = 20
    for ($i = 1; $i -le $steps; $i++) {
      [void][Inp]::SetCursorPos(
        [int]($X + ($ToX - $X) * $i / $steps),
        [int]($Y + ($ToY - $Y) * $i / $steps))
      Start-Sleep -Milliseconds 15
    }
    Start-Sleep -Milliseconds 120
    [Inp]::mouse_event([Inp]::LUP, 0, 0, 0, [IntPtr]::Zero)
    Write-Output "drag $X,$Y -> $ToX,$ToY"
  }
  'type' {
    # לחיצה על השדה, בחירת הקיים, ואז הקלדה מעליו
    [Inp]::mouse_event([Inp]::LDOWN, 0, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 60
    [Inp]::mouse_event([Inp]::LUP, 0, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 500
    # SendKeys לא מגיע לחלון המוזרם של Phone Link — צריך keybd_event אמיתי
    $KEYUP = 0x02
    $CTRL = 0x11; $BACK = 0x08
    [Inp]::keybd_event($CTRL, 0, 0, [IntPtr]::Zero)
    [Inp]::keybd_event(0x41, 0, 0, [IntPtr]::Zero)          # A
    [Inp]::keybd_event(0x41, 0, $KEYUP, [IntPtr]::Zero)
    [Inp]::keybd_event($CTRL, 0, $KEYUP, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 250
    [Inp]::keybd_event($BACK, 0, 0, [IntPtr]::Zero)
    [Inp]::keybd_event($BACK, 0, $KEYUP, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 250
    foreach ($ch in $Text.ToCharArray()) {
      $vk = [Inp]::VkKeyScan($ch)
      $code = [byte]($vk -band 0xFF)
      $shift = ($vk -band 0x100) -ne 0
      if ($shift) { [Inp]::keybd_event(0x10, 0, 0, [IntPtr]::Zero) }
      [Inp]::keybd_event($code, 0, 0, [IntPtr]::Zero)
      [Inp]::keybd_event($code, 0, $KEYUP, [IntPtr]::Zero)
      if ($shift) { [Inp]::keybd_event(0x10, 0, $KEYUP, [IntPtr]::Zero) }
      Start-Sleep -Milliseconds 120
    }
    Write-Output "type '$Text' @ $X,$Y"
  }
  'keys' {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.SendKeys]::SendWait($Text)
    Write-Output "keys '$Text'"
  }
}
Start-Sleep -Milliseconds 400
