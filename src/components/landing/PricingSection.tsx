import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { trackEvent, withPerfTracking, logError } from "@/lib/analytics";

export function PricingSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loadingBuilder, setLoadingBuilder] = useState(false);
  const [loadingPro, setLoadingPro] = useState(false);

  const handleCheckout = async (tier: "builder" | "pro", setLoading: (v: boolean) => void) => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }

    setLoading(true);
    trackEvent("clicked_upgrade", { source: "pricing_section", tier });
    try {
      const data = await withPerfTracking("stripe_checkout", async () => {
        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: { return_url: window.location.origin, tier },
        });
        if (error) throw error;
        return data;
      }, 1500);
      if (data?.url) {
        trackEvent("checkout_started", { tier });
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Starten des Checkouts");
      logError(err.message || "Checkout failed", { errorType: "api", metadata: { tier } });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: t("pricing.free"),
      price: t("pricing.freePrice"),
      period: t("pricing.freePeriod"),
      features: [t("pricing.freeF1"), t("pricing.freeF2"), t("pricing.freeF3"), t("pricing.freeF4")],
      cta: t("pricing.freeCta"),
      highlighted: false,
      badge: null,
      onClick: () => navigate("/auth"),
      loading: false,
    },
    {
      name: t("pricing.pro"),
      price: t("pricing.proPrice"),
      period: t("pricing.proPeriod"),
      features: [t("pricing.proF1"), t("pricing.proF2"), t("pricing.proF3"), t("pricing.proF4"), t("pricing.proF5"), t("pricing.proF6")],
      cta: loadingBuilder ? t("upgrade.processing") : t("pricing.proCta"),
      highlighted: true,
      badge: t("pricing.popular"),
      onClick: () => handleCheckout("builder", setLoadingBuilder),
      loading: loadingBuilder,
    },
    {
      name: t("pricing.proTier"),
      price: t("pricing.proTierPrice"),
      period: t("pricing.proTierPeriod"),
      features: [
        t("pricing.proTierF1"),
        t("pricing.proTierF2"),
        t("pricing.proTierF3"),
        t("pricing.proTierF4"),
        t("pricing.proTierF5"),
        t("pricing.proTierF6"),
      ],
      cta: loadingPro ? t("upgrade.processing") : t("pricing.proTierCta"),
      highlighted: false,
      badge: t("pricing.proTierBadge"),
      onClick: () => handleCheckout("pro", setLoadingPro),
      loading: loadingPro,
    },
  ];

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg ring-1 ring-accent/20"
                  : "bg-card shadow-card"
              }`}
            >
              {plan.badge && (
                <div className={`absolute -top-3 left-6 rounded-full px-3 py-0.5 text-xs font-semibold ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {plan.badge}
                </div>
              )}
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-8 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 w-full ${
                  plan.highlighted
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : ""
                }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={plan.onClick}
                disabled={plan.loading}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
