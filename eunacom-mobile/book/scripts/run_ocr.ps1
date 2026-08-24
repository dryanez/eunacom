$path = "d:\Anti\Eunacom\eunacom-app-v2\book\figuras_galeria\Screenshot 2026-08-19 121444.png"

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType = WindowsRuntime] | Out-Null

$fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($path)
$file = $fileTask.GetAwaiter().GetResult()

$streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
$stream = $streamTask.GetAwaiter().GetResult()

$decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = $decoderTask.GetAwaiter().GetResult()

$bitmapTask = $decoder.GetSoftwareBitmapAsync()
$bitmap = $bitmapTask.GetAwaiter().GetResult()

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("es-ES"))
if ($null -eq $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
}

$ocrTask = $engine.RecognizeAsync($bitmap)
$result = $ocrTask.GetAwaiter().GetResult()

Write-Output "=== OCR TEXT IN MAIN OVERVIEW SCREENSHOT ==="
Write-Output $result.Text
