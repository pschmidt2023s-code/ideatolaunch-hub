# BrandOS Installer/Image Converter
# Converts icon + installer source images for Tauri/NSIS
# Run: powershell -ExecutionPolicy Bypass -File convert-installer-images.ps1

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class IconCleanup {
  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  public static extern bool DestroyIcon(IntPtr handle);
}
"@

$iconsDir = Join-Path $PSScriptRoot "src-tauri\icons"

# --- App Icon (PNG -> ICO) ---
$iconSource = Join-Path $iconsDir "icon.png"
$iconTarget = Join-Path $iconsDir "icon.ico"

if (Test-Path $iconSource) {
    $bmp = New-Object System.Drawing.Bitmap($iconSource)
    $hIcon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)

    $fs = [System.IO.File]::Open($iconTarget, [System.IO.FileMode]::Create)
    $icon.Save($fs)
    $fs.Close()

    $icon.Dispose()
    $bmp.Dispose()
    [IconCleanup]::DestroyIcon($hIcon) | Out-Null

    Write-Host "icon.ico erstellt" -ForegroundColor Green
} else {
    Write-Host "icon.png nicht gefunden!" -ForegroundColor Red
}

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

Write-Host "`nFertig! Jetzt nacheinander ausführen:" -ForegroundColor Cyan
Write-Host "1) powershell -ExecutionPolicy Bypass -File convert-installer-images.ps1" -ForegroundColor Cyan
Write-Host "2) npm run tauri build" -ForegroundColor Cyan
