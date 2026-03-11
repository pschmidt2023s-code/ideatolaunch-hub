/**
 * Unified App Context — consolidates Brand, Mode, and Subscription providers
 * into a single context tree to reduce provider nesting and re-renders.
 *
 * Individual hooks (useBrand, useMode, useSubscription) remain as thin
 * re-exports for backward compatibility.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { STALE } from "@/hooks/useQueryDefaults";
import type { Tables } from "@/integrations/supabase/types";
import type { AppMode } from "@/lib/mode-types";

// ─── Subscription types ─────────────────────────────────────────────────────
export type Plan = "free" | "builder" | "pro" | "execution" | "trading";

// ─── Context shape ──────────────────────────────────────────────────────────
interface AppContextType {
  // Brand
  brands: Tables<"brands">[];
  activeBrand: Tables<"brands"> | null;
  setActiveBrandId: (id: string) => void;
  brandsLoading: boolean;
  refetchBrands: () => void;

  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  modeLoading: boolean;
  needsSelection: boolean;

  // Subscription
  subscription: Tables<"subscriptions"> | null;
  plan: Plan;
  isTrading: boolean;
  isExecution: boolean;
  isPro: boolean;
  isBuilder: boolean;
  isFree: boolean;
  licenseKey: string | null;
  subscriptionLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Brands ──────────────────────────────────────────────────────────────
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  const {
    data: brands = [],
    isLoading: brandsLoading,
    refetch: refetchBrands,
  } = useQuery({
    queryKey: ["brands", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: STALE.INTERACTIVE,
  });

  useEffect(() => {
    if (brands.length > 0 && !activeBrandId) {
      setActiveBrandId(brands[0].id);
    }
  }, [brands, activeBrandId]);

  const activeBrand = brands.find((b) => b.id === activeBrandId) ?? null;

  // ── Mode ────────────────────────────────────────────────────────────────
  const [needsSelection, setNeedsSelection] = useState(false);
  const [localMode, setLocalMode] = useState<AppMode>("founder");

  const { data: profileMode, isLoading: modeQueryLoading } = useQuery({
    queryKey: ["profile-mode", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("selected_mode")
        .eq("user_id", user!.id)
        .maybeSingle();
      return (data?.selected_mode as AppMode) ?? "founder";
    },
    enabled: !!user,
    staleTime: STALE.STATIC,
  });

  useEffect(() => {
    if (profileMode) {
      setLocalMode(profileMode);
      setNeedsSelection(false);
    }
  }, [profileMode]);

  useEffect(() => {
    if (!modeQueryLoading && user && !profileMode) {
      setNeedsSelection(true);
    }
  }, [modeQueryLoading, user, profileMode]);

  const setMode = async (newMode: AppMode) => {
    setLocalMode(newMode);
    setNeedsSelection(false);
    if (user) {
      await supabase
        .from("profiles")
        .update({ selected_mode: newMode })
        .eq("user_id", user.id);
      queryClient.invalidateQueries({ queryKey: ["profile-mode", user.id] });
    }
  };

  // ── Subscription ────────────────────────────────────────────────────────
  const { data: subscription = null, isLoading: subLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    staleTime: STALE.STATIC,
  });

  // ── License (new licenses table) ───────────────────────────────────────
  const { data: license = null } = useQuery({
    queryKey: ["license", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("validate-license", {
        body: {},
      });
      if (error) return null;
      return data as { valid: boolean; tier?: string; license_key?: string; source?: string; expires_at?: string } | null;
    },
    enabled: !!user,
    staleTime: STALE.STATIC,
    retry: 1,
  });

  const plan: Plan = useMemo(() => {
    // Priority: new licenses table > legacy subscriptions
    if (license?.valid && license.tier) {
      const t = license.tier;
      if (t === "enterprise" || t === "trading") return "trading";
      if (t === "execution") return "execution";
      if (t === "pro") return "pro";
      if (t === "starter" || t === "builder") return "builder";
    }
    const s = subscription?.status;
    if (s === "trading") return "trading";
    if (s === "execution") return "execution";
    if (s === "pro") return "pro";
    if (s === "builder") return "builder";
    return "free";
  }, [subscription?.status, license]);

  const isTrading = plan === "trading";
  const isExecution = plan === "execution" || isTrading;
  const isPro = plan === "pro" || isExecution;
  const isBuilder = plan === "builder" || isPro;
  const isFree = plan === "free";
  const licenseKey = license?.license_key ?? (subscription?.license_key as string | null) ?? null;

  // ── Memoised value ──────────────────────────────────────────────────────
  const value = useMemo<AppContextType>(
    () => ({
      brands,
      activeBrand,
      setActiveBrandId,
      brandsLoading,
      refetchBrands,
      mode: localMode,
      setMode,
      modeLoading: modeQueryLoading,
      needsSelection,
      subscription,
      plan,
      isTrading,
      isExecution,
      isPro,
      isBuilder,
      isFree,
      licenseKey,
      subscriptionLoading: subLoading,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      brands,
      activeBrand,
      brandsLoading,
      localMode,
      modeQueryLoading,
      needsSelection,
      subscription,
      plan,
      subLoading,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Unified hook ───────────────────────────────────────────────────────────
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
