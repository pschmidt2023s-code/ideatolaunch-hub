import { useEffect } from "react";
import { useMode } from "@/hooks/useMode";
import { useTheme } from "next-themes";

/**
 * Auto-activates dark mode when trading mode is selected.
 * Place this component inside both ModeProvider and ThemeProvider.
 */
export function AutoDarkMode() {
  const { mode } = useMode();
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (mode === "trading" && theme !== "dark") {
      setTheme("dark");
    }
  }, [mode]);

  return null;
}
