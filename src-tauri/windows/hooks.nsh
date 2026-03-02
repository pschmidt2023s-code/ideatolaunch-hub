; BrandOS Custom NSIS Installer Hooks
; BuildYourBrand, Deutschland
; https://brand.aldenairperfumes.de/#/datenschutz

; ============================================
; Custom Colors for Welcome & Finish Pages
; Dark navy theme matching BrandOS branding
; ============================================
!define MUI_BGCOLOR "0B1628"
!define MUI_TEXTCOLOR "FFFFFF"

; Custom branding text at the bottom of the installer
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Möchten Sie die Installation von BrandOS wirklich abbrechen?"

!macro NSIS_HOOK_PREINSTALL
  ; Close running BrandOS instance before installing
  nsExec::ExecToLog 'taskkill /f /im "BrandOS.exe"'
  Sleep 500
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Write BuildYourBrand info to registry
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Publisher" "BuildYourBrand"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Country" "Deutschland"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Website" "https://brand.aldenairperfumes.de"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Privacy" "https://brand.aldenairperfumes.de/#/datenschutz"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Close app before uninstall
  nsExec::ExecToLog 'taskkill /f /im "BrandOS.exe"'
  Sleep 500
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; Clean up BuildYourBrand registry entries
  DeleteRegKey SHCTX "Software\BuildYourBrand\BrandOS"
  DeleteRegKey /ifempty SHCTX "Software\BuildYourBrand"
!macroend
