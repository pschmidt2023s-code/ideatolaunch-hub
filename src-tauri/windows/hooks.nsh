; BrandOS NSIS Installer Hooks
; Custom installation steps for BrandOS

!macro NSIS_HOOK_PREINSTALL
  ; Check if a previous version is running and close it
  nsExec::ExecToLog 'taskkill /f /im "BrandOS.exe"'
  Sleep 500
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Create desktop shortcut
  CreateShortCut "$DESKTOP\BrandOS.lnk" "$INSTDIR\BrandOS.exe" "" "$INSTDIR\BrandOS.exe" 0

  ; Create Start Menu folder and shortcuts
  CreateDirectory "$SMPROGRAMS\BrandOS"
  CreateShortCut "$SMPROGRAMS\BrandOS\BrandOS.lnk" "$INSTDIR\BrandOS.exe" "" "$INSTDIR\BrandOS.exe" 0
  CreateShortCut "$SMPROGRAMS\BrandOS\BrandOS deinstallieren.lnk" "$INSTDIR\uninstall.exe"

  ; Write additional registry info
  WriteRegStr HKCU "Software\BrandOS" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\BrandOS" "Version" "${VERSION}"
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Close app before uninstall
  nsExec::ExecToLog 'taskkill /f /im "BrandOS.exe"'
  Sleep 500
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; Remove desktop shortcut
  Delete "$DESKTOP\BrandOS.lnk"

  ; Remove Start Menu entries
  Delete "$SMPROGRAMS\BrandOS\BrandOS.lnk"
  Delete "$SMPROGRAMS\BrandOS\BrandOS deinstallieren.lnk"
  RMDir "$SMPROGRAMS\BrandOS"

  ; Clean registry
  DeleteRegKey HKCU "Software\BrandOS"
!macroend
