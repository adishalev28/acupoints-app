# חילוץ טאב Indications מצילומי מסך של אפליקציית שון גודמן.
#
# למה זה קיים: בחילוץ המקורי גבולות הכרטיסים נמחקו, והכרטיס הראשון —
# ההתוויות של דונג עצמו — התמזג עם התוויות של מטפלים מאוחרים.
# הסקריפט מזהה את מלבני הכרטיסים לפי צבע הרקע (245,244,246 מול לבן),
# מריץ OCR, ומסמן לכל שורה לאיזה כרטיס היא שייכת.
#
# הטאב מכיל שתי שכבות:
#   1. כרטיסי Indications (רקע אפור) — כרטיס 1 = ההתוויות של דונג
#   2. Additional Information (טקסט חופשי בתחתית) — פרוזה קלינית
#
#   powershell -NoProfile -File cards.ps1 -Path shot.png        # קובץ בודד
#   powershell -NoProfile -File cards.ps1 -Path C:\shots\       # כל התיקייה
#
# פלט: JSON — מערך של { file, point, lines: [{ y, card, text }] }
#   card = מספר הכרטיס בצילום הזה, או 0 עבור טקסט מחוץ לכרטיס

param(
  [Parameter(Mandatory)][string]$Path,
  [string]$Out = '',
  [int]$Top = 330,          # מתחת לכותרת הדביקה
  [int]$Bottom = 914,       # מעל סרגל הניווט התחתון
  [int]$ScanX = 1850,       # עמודה בתוך הכרטיס אך מימין לטקסט
  [int]$ClipMargin = 28     # שורה בתוך השוליים האלה נחתכת ע"י גבול אזור התוכן
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# --- מנוע OCR (יקר לטעינה — פעם אחת לכל ההרצה) ---
$null = [System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime')
[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]
function Await($op, $type) {
  $t = $asTask.MakeGenericMethod($type).Invoke($null, @($op)); $t.Wait(-1) | Out-Null; return $t.Result
}

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage((New-Object Windows.Globalization.Language 'en-US'))
}
if (-not $engine) { Write-Error 'אין מנוע OCR זמין'; exit 1 }

function Ocr([string]$p) {
  $f = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($p)) ([Windows.Storage.StorageFile])
  $s = Await ($f.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
  $d = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($s)) ([Windows.Graphics.Imaging.BitmapDecoder])
  $sb = Await ($d.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
  return Await ($engine.RecognizeAsync($sb)) ([Windows.Media.Ocr.OcrResult])
}

function Process-Shot([string]$file) {
  $bmp = [System.Drawing.Bitmap]::FromFile($file)

  # רצפי פיקסלים אפורים = מלבני כרטיסים
  $bands = New-Object System.Collections.ArrayList
  $start = -1
  for ($y = $Top; $y -le $Bottom; $y++) {
    $p = $bmp.GetPixel($ScanX, $y)
    $isCard = ($p.R -lt 250 -and $p.R -gt 200 -and [Math]::Abs([int]$p.R - [int]$p.B) -lt 12)
    if ($isCard -and $start -lt 0) {
      $start = $y
    } elseif (-not $isCard -and $start -ge 0) {
      $h = $y - $start
      if ($h -ge 20) { [void]$bands.Add([pscustomobject]@{ y0 = $start; y1 = $y - 1 }) }
      $start = -1
    }
  }
  if ($start -ge 0) {
    $h = $Bottom - $start
    if ($h -ge 20) { [void]$bands.Add([pscustomobject]@{ y0 = $start; y1 = $Bottom }) }
  }

  # חיתוך אזור התוכן ואזור הכותרת
  $crops = @{}
  foreach ($spec in @(@('body', $Top, ($Bottom - $Top + 1)), @('head', 195, 120))) {
    $tag = $spec[0]; $sy = [int]$spec[1]; $hh = [int]$spec[2]
    $c = New-Object System.Drawing.Bitmap($bmp.Width, $hh)
    $g = [System.Drawing.Graphics]::FromImage($c)
    $g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $hh)),
      (New-Object System.Drawing.Rectangle(0, $sy, $bmp.Width, $hh)), [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $f = [System.IO.Path]::Combine($env:TEMP, "cards-$tag-$PID.png")
    $c.Save($f, [System.Drawing.Imaging.ImageFormat]::Png)
    $c.Dispose()
    $crops[$tag] = $f
  }
  $bmp.Dispose()

  $body = Ocr $crops['body']
  $head = Ocr $crops['head']
  Remove-Item $crops.Values -Force -ErrorAction SilentlyContinue

  # חלק מהנקודות אינן ממוספרות (ZhengNao, TongChang...) — לכן שומרים
  # גם את הכותרת המלאה, שהיא המזהה היחיד עבורן
  $point = ''
  $headText = ($head.Lines | ForEach-Object { $_.Text }) -join ' | '
  foreach ($l in $head.Lines) {
    if ($l.Text -match '^\s*(\d{1,2}\.\d{2}(?:-\d{2})*)') { $point = $Matches[1]; break }
  }

  $cropH = $Bottom - $Top + 1
  $lines = New-Object System.Collections.ArrayList
  foreach ($l in $body.Lines) {
    $tops = $l.Words | ForEach-Object { $_.BoundingRect.Y } | Sort-Object
    $bots = $l.Words | ForEach-Object { $_.BoundingRect.Y + $_.BoundingRect.Height } | Sort-Object -Descending
    if (-not $tops) { continue }
    $ry = [int]$tops[0]           # יחסית לאזור החיתוך
    $rb = [int]$bots[0]
    # האפליקציה חותכת טקסט שנכנס אל מתחת לכותרת הדביקה או אל סרגל הניווט.
    # חצי אות נקרא שגוי ("spine" הופך ל-"soine"), ואז התפירה לא מזהה חפיפה
    # ומשכפלת את המשפט. השורה מופיעה שלמה בצילום החופף, לכן משמיטים.
    $clipped = ($ry -le $ClipMargin) -or ($rb -ge ($cropH - $ClipMargin))
    $y = $ry + $Top
    $mid = $y + 18
    $card = 0; $n = 0
    foreach ($b in $bands) {
      $n++
      if ($mid -ge $b.y0 -and $mid -le $b.y1) { $card = $n; break }
    }
    [void]$lines.Add([pscustomobject]@{ y = $y; card = $card; clipped = $clipped; text = $l.Text })
  }

  return [pscustomobject]@{
    file   = Split-Path $file -Leaf
    point  = $point
    header = $headText
    lines  = $lines
  }
}

$target = (Resolve-Path $Path).Path
if (Test-Path $target -PathType Container) {
  $files = Get-ChildItem -Path $target -Filter '*.png' | Sort-Object Name | ForEach-Object { $_.FullName }
} else {
  $files = @($target)
}

$all = New-Object System.Collections.ArrayList
foreach ($f in $files) {
  Write-Verbose "OCR: $f"
  [void]$all.Add((Process-Shot $f))
}

$json = $all | ConvertTo-Json -Depth 6 -Compress
if ($Out) {
  $outPath = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path (Get-Location) $Out }
  [System.IO.File]::WriteAllText($outPath, $json, (New-Object System.Text.UTF8Encoding $false))
  Write-Output "wrote $($all.Count) shots -> $Out"
} else {
  Write-Output $json
}
