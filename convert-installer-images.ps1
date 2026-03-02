# BrandOS Installer Image Converter
# Converts PNG source images to BMP format for NSIS installer
# Run: powershell -ExecutionPolicy Bypass -File convert-installer-images.ps1

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "src-tauri\icons"

# --- Sidebar Image (164x314) ---
$sidebarSource = Join-Path $iconsDir "sidebar-source.png"
$sidebarTarget = Join-Path $iconsDir "sidebar.bmp"

if (Test-Path $sidebarSource) {
    $img = [System.Drawing.Image]::FromFile($sidebarSource)
    $bmp = New-Object System.Drawing.Bitmap(164, 314)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 164, 314)
    $g.Dispose()
    $img.Dispose()
    $bmp.Save($sidebarTarget, [System.Drawing.Imaging.ImageFormat]::Bmp)
    $bmp.Dispose()
    Write-Host "sidebar.bmp erstellt (164x314)" -ForegroundColor Green
} else {
    Write-Host "sidebar-source.png nicht gefunden!" -ForegroundColor Red
}

# --- Header Image (150x57) ---
$headerSource = Join-Path $iconsDir "header-source.png"
$headerTarget = Join-Path $iconsDir "header.bmp"

if (Test-Path $headerSource) {
    $img = [System.Drawing.Image]::FromFile($headerSource)
    $bmp = New-Object System.Drawing.Bitmap(150, 57)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 150, 57)
    $g.Dispose()
    $img.Dispose()
    $bmp.Save($headerTarget, [System.Drawing.Imaging.ImageFormat]::Bmp)
    $bmp.Dispose()
    Write-Host "header.bmp erstellt (150x57)" -ForegroundColor Green
} else {
    Write-Host "header-source.png nicht gefunden!" -ForegroundColor Red
}

Write-Host "`nFertig! Jetzt 'npm run tauri build' ausfuehren." -ForegroundColor Cyan
