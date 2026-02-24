import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useBrand } from "@/hooks/useBrand";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plus,
  ArrowRight,
  Lightbulb,
  Palette,
  Calculator,
  Factory,
  Shield,
  ShoppingBag,
  Rocket,
} from "lucide-react";

const stepIcons = [Lightbulb, Palette, Calculator, Factory, Shield, ShoppingBag, Rocket];

export default function Dashboard() {
  const { user } = useAuth();
  const { brands, activeBrand, setActiveBrandId, refetchBrands } = useBrand();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const stepKeys = ["s1", "s2", "s3", "s4", "s5", "s6", "s7"];

  const createBrand = async () => {
    const { error } = await supabase.from("brands").insert({
      user_id: user!.id,
      name: "Neue Marke",
    });
    if (error) {
      toast.error(t("steps.saveError"));
      return;
    }
    toast.success(t("steps.saved"));
    refetchBrands();
  };

  const currentBrand = activeBrand;
  const progress = currentBrand ? Math.round(((currentBrand.current_step - 1) / 7) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
            <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button
            onClick={createBrand}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.newBrand")}
          </Button>
        </div>

        {!brands?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Plus className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">{t("dashboard.createFirst")}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("dashboard.createFirstDesc")}</p>
            <Button
              onClick={createBrand}
              className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              {t("dashboard.createBrand")}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand Health Score */}
            {currentBrand && <BrandHealthCard />}

            {currentBrand && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{currentBrand.name}</h2>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {t("dashboard.stepOf", { step: currentBrand.current_step })}
                  </span>
                </div>
                <Progress value={progress} className="mb-6 h-2" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {stepKeys.map((key, i) => {
                    const Icon = stepIcons[i];
                    const stepNum = i + 1;
                    const isCompleted = stepNum < currentBrand.current_step;
                    const isCurrent = stepNum === currentBrand.current_step;

                    return (
                      <button
                        key={key}
                        onClick={() => navigate(`/dashboard/step/${stepNum}`)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-md ${
                          isCurrent
                            ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                            : isCompleted
                            ? "border-green-500/30 bg-green-500/5"
                            : "opacity-60"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isCurrent ? "text-accent" : isCompleted ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium leading-tight">{t(`steps.${key}`)}</span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate(`/dashboard/step/${currentBrand.current_step}`)}
                >
                  {t("dashboard.continue")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {brands.length > 1 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">{t("dashboard.allBrands")}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {brands.filter((b) => b.id !== currentBrand?.id).map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-card cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setActiveBrandId(brand.id);
                        navigate(`/dashboard/step/${brand.current_step}`);
                      }}
                    >
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("dashboard.stepOf", { step: brand.current_step })}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
