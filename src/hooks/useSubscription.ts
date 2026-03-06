import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { STALE } from "@/hooks/useQueryDefaults";

export type Plan = "free" | "builder" | "pro" | "execution" | "trading";

export function useSubscription() {
  const { user } = useAuth();

  const { data: subscription, isLoading } = useQuery({
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

  const plan: Plan =
    subscription?.status === "trading"
      ? "trading"
      : subscription?.status === "execution"
      ? "execution"
      : subscription?.status === "pro"
      ? "pro"
      : subscription?.status === "builder"
      ? "builder"
      : "free";

  const isTrading = plan === "trading";
  const isExecution = plan === "execution" || isTrading;
  const isPro = plan === "pro" || isExecution;
  const isBuilder = plan === "builder" || isPro;
  const isFree = plan === "free";

  const licenseKey = subscription?.license_key as string | null ?? null;

  return {
    subscription,
    plan,
    isTrading,
    isExecution,
    isPro,
    isBuilder,
    isFree,
    licenseKey,
    loading: isLoading,
  };
}
