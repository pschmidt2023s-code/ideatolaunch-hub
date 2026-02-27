import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type Plan = "free" | "builder" | "pro" | "execution";

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
  });

  const plan: Plan =
    subscription?.status === "execution"
      ? "execution"
      : subscription?.status === "pro"
      ? "pro"
      : subscription?.status === "builder"
      ? "builder"
      : "free";

  const isExecution = plan === "execution";
  const isPro = plan === "pro" || plan === "execution";
  const isBuilder = plan === "builder" || isPro;
  const isFree = plan === "free";

  return {
    subscription,
    plan,
    isExecution,
    isPro,
    isBuilder,
    isFree,
    loading: isLoading,
  };
}
