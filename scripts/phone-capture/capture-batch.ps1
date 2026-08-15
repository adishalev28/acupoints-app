# סריקת אצווה של נקודות מאפליקציית שון גודמן דרך Phone Link.
# לכל נקודה: פותח את טאב Indications, מצלם, גולל עד הסוף, עובר לנקודה הבאה.
# עצירה אוטומטית כשהצילום זהה לקודם (= הגענו לתחתית).
#
# דוגמה:
#   powershell -NoProfile -File capture-batch.ps1 -Ids "77.01,77.02,77.03" -OutDir "C:\tmp\dong"

param(
  [Parameter(Mandatory)][string]$Ids,      # רשימת מזהים מופרדת בפסיקים, לפי סדר הניווט באפליקציה
  [Parameter(Mandatory)][string]$OutDir,
  [int]$MaxScrolls = 45,      # נקודות עם Additional Information ארוך עוברות 22
  [int]$ScrollAmount = -12,
  [int]$SettleMs = 900        # אנימציית הגלילה חייבת להסתיים לפני הצילום,
)                             # אחרת התמונה מטושטשת וה-OCR ממציא מילים

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$phone = Join-Path $here 'phone.ps1'
$input_ = Join-Path $here 'input.ps1'

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir -Force | Out-Null }

# קואורדינטות במסך מלא 1920x988 — ראה README
$TAB_INDICATIONS = @{ X = 1830; Y = 167 }
$NEXT_POINT      = @{ X = 1868; Y = 953 }
$SCROLL_AT       = @{ X = 960;  Y = 650 }

function Shot([string]$path) {
  & powershell -NoProfile -File $phone -NoFocus -Out $path | Out-Null
  return (Get-FileHash $path -Algorithm MD5).Hash
}
function Click([int]$x, [int]$y) {
  & powershell -NoProfile -File $input_ -Action click -X $x -Y $y | Out-Null
}
function Scroll() {
  & powershell -NoProfile -File $input_ -Action scroll -X $SCROLL_AT.X -Y $SCROLL_AT.Y -Amount $ScrollAmount | Out-Null
}

$list = $Ids -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ }

foreach ($id in $list) {
  Write-Output "=== $id ==="

  # הלחיצה הראשונה אחרי ניווט נבלעת (מפעילה את החלון) — לכן פעמיים
  Click $TAB_INDICATIONS.X $TAB_INDICATIONS.Y
  Start-Sleep -Milliseconds 400
  Click $TAB_INDICATIONS.X $TAB_INDICATIONS.Y
  Start-Sleep -Milliseconds 900

  $prev = ''
  for ($i = 1; $i -le $MaxScrolls; $i++) {
    $file = Join-Path $OutDir ("{0}_{1:d2}.png" -f $id, $i)
    $hash = Shot $file
    if ($hash -eq $prev) {
      # אין שינוי — הגענו לתחתית. מוחקים את הכפילות.
      Remove-Item $file -Force
      Write-Output "  $i screens (bottom)"
      break
    }
    $prev = $hash
    Scroll
    Start-Sleep -Milliseconds $SettleMs
    if ($i -eq $MaxScrolls) { Write-Output "  $i screens (MAX — ייתכן שנחתך)" }
  }

  Click $NEXT_POINT.X $NEXT_POINT.Y
  Start-Sleep -Milliseconds 1200
}

Write-Output "DONE"
