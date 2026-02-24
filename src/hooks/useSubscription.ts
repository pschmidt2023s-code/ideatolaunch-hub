import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export type Plan = "free" | "builder";

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

  const plan: Plan = subscription?.status === "builder" ? "builder" : "free";
  const isBuilder = plan === "builder";
  const isFree = plan === "free";

  return {
    subscription,
    plan,
    isBuilder,
    isFree,
    loading: isLoading,
  };
}
