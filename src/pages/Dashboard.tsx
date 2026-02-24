import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "sonner";

const stepIcons = [Lightbulb, Palette, Calculator, Factory, Shield, ShoppingBag, Rocket];
const stepLabels = [
  "Ideen-Fundament",
  "Markenstruktur",
  "Business-Kalkulator",
  "Produktion",
  "Compliance",
  "Vertrieb",
  "Launch-Roadmap",
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: brands, refetch } = useQuery({
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
  });

  const createBrand = async () => {
    const { error } = await supabase.from("brands").insert({
      user_id: user!.id,
      name: "Neue Marke",
    });
    if (error) {
      toast.error("Fehler beim Erstellen");
      return;
    }
    toast.success("Marke erstellt!");
    refetch();
  };

  const currentBrand = brands?.[0];
  const progress = currentBrand ? Math.round(((currentBrand.current_step - 1) / 7) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Dein Brand-Command-Center
            </p>
          </div>
          <Button
            onClick={createBrand}
            className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Neue Marke
          </Button>
        </div>

        {!brands?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <Plus className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">Erstelle deine erste Marke</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Starte den geführten Workflow und baue deine Marke Schritt für Schritt auf.
            </p>
            <Button
              onClick={createBrand}
              className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              Marke erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Brand Card */}
            {currentBrand && (
              <div className="rounded-xl border bg-card p-6 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{currentBrand.name}</h2>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    Schritt {currentBrand.current_step} von 7
                  </span>
                </div>
                <Progress value={progress} className="mb-6 h-2" />

                {/* Step Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {stepLabels.map((label, i) => {
                    const Icon = stepIcons[i];
                    const stepNum = i + 1;
                    const isCompleted = stepNum < currentBrand.current_step;
                    const isCurrent = stepNum === currentBrand.current_step;

                    return (
                      <button
                        key={label}
                        onClick={() => navigate(`/dashboard/step/${stepNum}`)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all hover:shadow-md ${
                          isCurrent
                            ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                            : isCompleted
                            ? "border-success/30 bg-success/5"
                            : "opacity-60"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isCurrent ? "text-accent" : isCompleted ? "text-success" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>

                <Button
                  className="mt-6 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => navigate(`/dashboard/step/${currentBrand.current_step}`)}
                >
                  Weiterarbeiten
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* All Brands */}
            {brands.length > 1 && (
              <div>
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Alle Marken</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {brands.slice(1).map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-card cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/dashboard/step/${brand.current_step}`)}
                    >
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Schritt {brand.current_step} von 7
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
