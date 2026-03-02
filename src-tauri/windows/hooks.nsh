; BrandOS Custom NSIS Installer Hooks
; BuildYourBrand, Deutschland
; https://brand.aldenairperfumes.de/#/datenschutz

; ============================================
; Custom Colors & Branding
; ============================================
!define MUI_BGCOLOR "0B1628"
!define MUI_TEXTCOLOR "FFFFFF"

; Abort warning in German
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Möchten Sie die Installation von BrandOS wirklich abbrechen?"

; ============================================
; Welcome Page — German text overrides
; ============================================
!define MUI_WELCOMEPAGE_TITLE "Willkommen bei BrandOS"
!define MUI_WELCOMEPAGE_TEXT "Dieses Setup installiert BrandOS – das Founder Operating System für Private-Label-Gründer.$\r$\n$\r$\nBrandOS hilft dir, teure Produktionsfehler zu vermeiden, deine Kalkulation zu optimieren und deine Marke datenbasiert aufzubauen.$\r$\n$\r$\nVersion: ${VERSION}$\r$\n$\r$\nKlicke auf Weiter, um fortzufahren."

; ============================================
; Finish Page — German text overrides
; ============================================
!define MUI_FINISHPAGE_TITLE "Installation abgeschlossen"
!define MUI_FINISHPAGE_TEXT "BrandOS wurde erfolgreich installiert.$\r$\n$\r$\nDein Founder Operating System ist bereit. Starte jetzt und baue deine Marke intelligent auf.$\r$\n$\r$\nKlicke auf Fertigstellen, um das Setup zu beenden."
!define MUI_FINISHPAGE_LINK "BrandOS Website besuchen"
!define MUI_FINISHPAGE_LINK_LOCATION "https://brand.aldenairperfumes.de"

; ============================================
; Directory Page — German text
; ============================================
!define MUI_DIRECTORYPAGE_TEXT_TOP "Wähle das Verzeichnis, in dem BrandOS installiert werden soll."

; ============================================
; Uninstall Confirm — German text
; ============================================
!define MUI_UNCONFIRMPAGE_TEXT_TOP "BrandOS wird von deinem Computer entfernt. Alle gespeicherten Daten in der Cloud bleiben erhalten."

; ============================================
; Button text overrides (German)
; ============================================
!macro NSIS_HOOK_PREINSTALL
  ; Close running BrandOS instance before installing
  nsExec::ExecToLog 'taskkill /f /im "BrandOS.exe"'
  Sleep 500

  ; Override button texts to German
  SendMessage $HWNDPARENT ${WM_SETTEXT} 0 "STR:BrandOS Setup"
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Write BuildYourBrand info to registry
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Publisher" "BuildYourBrand"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Country" "Deutschland"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Website" "https://brand.aldenairperfumes.de"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Privacy" "https://brand.aldenairperfumes.de/#/datenschutz"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "Version" "${VERSION}"
  WriteRegStr SHCTX "Software\BuildYourBrand\BrandOS" "InstallDate" "$\r$\n"

  ; Add to Windows "Apps & Features" with proper branding
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\BrandOS" "DisplayName" "BrandOS – Founder Operating System"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\BrandOS" "Publisher" "BuildYourBrand, Deutschland"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\BrandOS" "URLInfoAbout" "https://brand.aldenairperfumes.de"
  WriteRegStr SHCTX "Software\Microsoft\Windows\CurrentVersion\Uninstall\BrandOS" "HelpLink" "https://brand.aldenairperfumes.de"
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
