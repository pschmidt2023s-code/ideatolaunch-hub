import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Loader2, User, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const { isFree } = useSubscription();
  const { t } = useTranslation();

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
              {isFree ? "Free" : "Builder"}
            </span>
          </p>
          {isFree && (
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => window.location.href = "/pricing"}
            >
              {t("upgrade.cta")}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
