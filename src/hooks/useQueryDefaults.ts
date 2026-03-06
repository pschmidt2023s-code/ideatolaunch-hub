/**
 * Shared React Query configuration & prefetch utilities.
 * Centralises stale times so every hook uses consistent caching.
 */
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

/** Stale-time constants (ms) */
export const STALE = {
  /** Rarely changes: subscription, profile */
  STATIC: 10 * 60 * 1000,
  /** Changes on user action: brands, brand data */
  INTERACTIVE: 5 * 60 * 1000,
  /** Frequently updated: analytics, events */
  LIVE: 60 * 1000,
} as const;

/**
 * Hook that prefetches common dashboard data on mount / navigation.
 * Call once in dashboard layout to warm the cache.
 */
export function usePrefetchDashboard(userId: string | undefined) {
  const qc = useQueryClient();

  return useCallback(() => {
    if (!userId) return;

    // Prefetch subscription (almost never changes mid-session)
    qc.prefetchQuery({
      queryKey: ["subscription", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        return data;
      },
      staleTime: STALE.STATIC,
    });

    // Prefetch brands
    qc.prefetchQuery({
      queryKey: ["brands", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("brands")
          .select("*")
          .order("created_at", { ascending: false });
        return data ?? [];
      },
      staleTime: STALE.INTERACTIVE,
    });

    // Prefetch profile
    qc.prefetchQuery({
      queryKey: ["profile-starter", userId],
      queryFn: async () => {
        const { data } = await supabase
          .from("profiles")
          .select("completed_starter_mode")
          .eq("user_id", userId)
          .maybeSingle();
        return data;
      },
      staleTime: STALE.STATIC,
    });
  }, [userId, qc]);
}
