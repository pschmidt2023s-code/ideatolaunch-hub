import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2, User, CreditCard, FlaskConical, KeyRound, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { getClientMode, setClientMode, type ClientMode } from "@/lib/beta-client";

export default function SettingsPage() {
  const { user } = useAuth();
  const { isFree, plan } = useSubscription();
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, company_name")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (data) {
        setFirstName(data.first_name ?? "");
        setLastName(data.last_name ?? "");
        setCompanyName(data.company_name ?? "");
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim(),
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(t("steps.saveError"));
    } else {
      toast.success(t("steps.saved"));
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">{t("dashboard.settings")}</h1>

        {/* Profile */}
        <div className="rounded-xl border bg-card p-6 shadow-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <User className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">{t("settings.profile")}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("settings.firstName")}</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("settings.lastName")}</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("settings.company")}</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {t("settings.email")}: <span className="font-medium text-foreground">{user?.email}</span>
            </p>
          </div>

          <Button onClick={handleSave} disabled={saving} className="mt-6 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {t("steps.save")}
          </Button>
        </div>

        {/* Plan */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">{t("settings.plan")}</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.currentPlan")}:{" "}
            <span className="font-semibold text-foreground">
              {plan === "execution" ? "Execution OS" : plan === "pro" ? "Pro" : plan === "builder" ? "Builder" : "Free"}
            </span>
          </p>
          <Button
            variant="outline"
            className="mt-4 gap-2"
            onClick={() => navigate("/dashboard/pricing")}
          >
            {isFree
              ? t("upgrade.cta")
              : isDE
              ? "Abo verwalten"
              : "Manage subscription"}
          </Button>
        </div>

        {/* Beta Client */}
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <FlaskConical className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-lg font-semibold">Beta Client</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {isDE
              ? "Aktiviere den Beta-Modus, um neue Features vorab zu testen. Erfordert einen Neustart der Seite."
              : "Enable beta mode to test new features early. Requires a page reload."}
          </p>
          <div className="flex items-center gap-3">
            <Switch
              checked={getClientMode() === "beta"}
              onCheckedChange={(checked) => {
                setClientMode(checked ? "beta" : "production");
                toast.info(isDE ? "Beta-Modus geändert. Seite wird neu geladen…" : "Beta mode changed. Reloading…");
                setTimeout(() => window.location.reload(), 800);
              }}
            />
            <span className="text-sm font-medium">
              {getClientMode() === "beta" ? "Beta" : "Stable"}
            </span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
