/**
 * Brand hook — thin re-export from unified AppProvider.
 * All 41+ consumers keep working without import changes.
 */
import { createContext, useContext, ReactNode } from "react";
import { useAppContext, AppProvider as _AP } from "@/hooks/useAppContext";
import type { Tables } from "@/integrations/supabase/types";

interface BrandContextType {
  brands: Tables<"brands">[];
  activeBrand: Tables<"brands"> | null;
  setActiveBrandId: (id: string) => void;
  loading: boolean;
  refetchBrands: () => void;
}

/**
 * @deprecated – kept for backward compatibility.
 * AppProvider in App.tsx already covers this.
 */
export function BrandProvider({ children }: { children: ReactNode }) {
  // No-op wrapper: AppProvider already provides brand state
  return <>{children}</>;
}

export function useBrand(): BrandContextType {
  const ctx = useAppContext();
  return {
    brands: ctx.brands,
    activeBrand: ctx.activeBrand,
    setActiveBrandId: ctx.setActiveBrandId,
    loading: ctx.brandsLoading,
    refetchBrands: ctx.refetchBrands,
  };
}
