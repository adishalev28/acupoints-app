# OCR של צילום מסך באמצעות מנוע ה-OCR המובנה של Windows (Windows.Media.Ocr).
# מדפיס שורה לכל שורת טקסט שזוהתה, עם קואורדינטת Y כדי לשמר סדר וגבולות כרטיסים.
#
#   powershell -NoProfile -File ocr.ps1 -Path shot.png [-Crop "0,330,1920,590"]
#
# Crop = X,Y,W,H. שימושי לחיתוך סרגלי הכותרת והניווט שחוזרים בכל צילום.

param(
  [Parameter(Mandatory)][string]$Path,
  [string]$Crop = '',
  [switch]$WithY
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$full = (Resolve-Path $Path).Path

# חיתוך לקובץ זמני לפני ה-OCR
if ($Crop) {
  $c = $Crop -split ',' | ForEach-Object { [int]$_ }
  $src = [System.Drawing.Image]::FromFile($full)
  $rect = New-Object System.Drawing.Rectangle($c[0], $c[1], $c[2], $c[3])
  $bmp = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $rect.Width, $rect.Height)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $src.Dispose()
  $full = [System.IO.Path]::Combine($env:TEMP, "ocr-crop-$PID.png")
  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

[void][Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
[void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime]
[void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime]

# עוזר להמתנה לפעולות WinRT אסינכרוניות מתוך PowerShell 5.1
$null = [System.Reflection.Assembly]::LoadWithPartialName('System.Runtime.WindowsRuntime')
$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
  $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
  $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
})[0]

function Await($op, $type) {
  $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
  $task.Wait(-1) | Out-Null
  return $task.Result
}

$file = Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync($full)) ([Windows.Storage.StorageFile])
$stream = Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
$decoder = Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
$bitmap = Await ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
  $lang = New-Object Windows.Globalization.Language 'en-US'
  $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
}
if (-not $engine) { Write-Error 'אין מנוע OCR זמין'; exit 1 }

$result = Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])

foreach ($line in $result.Lines) {
  if ($WithY) {
    $y = [int](($line.Words | ForEach-Object { $_.BoundingRect.Y } | Sort-Object)[0])
    Write-Output ("{0,4}| {1}" -f $y, $line.Text)
  } else {
    Write-Output $line.Text
  }
}
