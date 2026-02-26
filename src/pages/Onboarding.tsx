import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lightbulb, GraduationCap, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function Onboarding() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-starter", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("completed_starter_mode")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // If already completed onboarding, skip directly to dashboard
  useEffect(() => {
    if (!isLoading && profile?.completed_starter_mode) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, profile, navigate]);

  const markCompleted = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ completed_starter_mode: true })
      .eq("user_id", user.id);
  };

  if (isLoading || profile?.completed_starter_mode) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
          <span className="text-xl font-bold text-primary-foreground">B</span>
        </div>
        <h1 className="text-2xl font-bold">{t("onboarding.title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("onboarding.subtitle")}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            onClick={async () => {
              await markCompleted();
              trackEvent("onboarding_finished", { path: "experienced" });
              navigate("/dashboard");
            }}
            className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-accent/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Lightbulb className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-semibold">{t("onboarding.experienced")}</h2>
            <p className="text-sm text-muted-foreground">{t("onboarding.experiencedDesc")}</p>
          </button>

          <button
            onClick={async () => {
              await markCompleted();
              trackEvent("onboarding_finished", { path: "beginner" });
              navigate("/starter");
            }}
            className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-card transition-all hover:shadow-md hover:border-accent/40"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <GraduationCap className="h-6 w-6 text-accent" />
            </div>
            <h2 className="font-semibold">{t("onboarding.beginner")}</h2>
            <p className="text-sm text-muted-foreground">{t("onboarding.beginnerDesc")}</p>
          </button>
        </div>
      </div>
    </div>
  );
}
