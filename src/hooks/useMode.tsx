/**
 * Mode hook — thin re-export from unified AppProvider.
 * All 7 consumers keep working without import changes.
 */
import { ReactNode } from "react";
import { useAppContext } from "@/hooks/useAppContext";
import type { AppMode } from "@/lib/mode-types";

interface ModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  loading: boolean;
  needsSelection: boolean;
}

/**
 * @deprecated – kept for backward compatibility.
 * AppProvider in App.tsx already covers this.
 */
export function ModeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useMode(): ModeContextType {
  const ctx = useAppContext();
  return {
    mode: ctx.mode,
    setMode: ctx.setMode,
    loading: ctx.modeLoading,
    needsSelection: ctx.needsSelection,
  };
}
