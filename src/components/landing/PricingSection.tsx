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
  const [loading, setLoading] = useState(false);

  const handleBuilderClick = async () => {
    if (!user) {
      navigate("/auth?tab=signup");
      return;
    }

    setLoading(true);
    trackEvent("clicked_upgrade", { source: "pricing_section" });
    try {
      const data = await withPerfTracking("stripe_checkout", async () => {
        const { data, error } = await supabase.functions.invoke("stripe-checkout", {
          body: { return_url: window.location.origin },
        });
        if (error) throw error;
        return data;
      }, 1500);
      if (data?.url) {
        trackEvent("checkout_started");
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Starten des Checkouts");
      logError(err.message || "Checkout failed", { errorType: "api" });
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
      onClick: () => navigate("/auth"),
    },
    {
      name: t("pricing.pro"),
      price: t("pricing.proPrice"),
      period: t("pricing.proPeriod"),
      features: [t("pricing.proF1"), t("pricing.proF2"), t("pricing.proF3"), t("pricing.proF4"), t("pricing.proF5"), t("pricing.proF6")],
      cta: loading ? t("upgrade.processing") : t("pricing.proCta"),
      highlighted: true,
      onClick: handleBuilderClick,
    },
  ];

  return (
    <section id="pricing" className="border-t px-4 py-20 md:py-32">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{t("pricing.title")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg ring-1 ring-accent/20"
                  : "bg-card shadow-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                  {t("pricing.popular")}
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
                disabled={plan.highlighted && loading}
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
