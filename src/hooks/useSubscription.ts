/**
 * Subscription hook — thin re-export from unified AppProvider.
 * All 31 consumers keep working without import changes.
 */
import { useAppContext } from "@/hooks/useAppContext";

export type { Plan } from "@/hooks/useAppContext";

export function useSubscription() {
  const ctx = useAppContext();
  return {
    subscription: ctx.subscription,
    plan: ctx.plan,
    isTrading: ctx.isTrading,
    isExecution: ctx.isExecution,
    isPro: ctx.isPro,
    isBuilder: ctx.isBuilder,
    isFree: ctx.isFree,
    licenseKey: ctx.licenseKey,
    loading: ctx.subscriptionLoading,
  };
}
