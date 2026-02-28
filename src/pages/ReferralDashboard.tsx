import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { Copy, Gift, Users, Check, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReferralData {
  referral_code: string;
  referral_count: number;
  reward_builder_months: number;
  reward_pro_trial: boolean;
}

export default function ReferralDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const load = async () => {
      // Check if user has referral record
      const { data: existing } = await supabase
        .from("referrals" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setData(existing as unknown as ReferralData);
      } else {
        // Create referral code
        const code = user.id.slice(0, 8).toUpperCase();
        const { data: created } = await supabase
          .from("referrals" as any)
          .insert({ user_id: user.id, referral_code: code })
          .select()
          .single();
        if (created) setData(created as unknown as ReferralData);
      }
      setLoading(false);
    };
    load();
  }, [user, authLoading, navigate]);

  const referralLink = data ? `${window.location.origin}/?ref=${data.referral_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Link kopiert!");
    trackEvent("referral_click", { action: "copy_link" });
    setTimeout(() => setCopied(false), 2000);
  };

  const rewards = [
    { threshold: 2, label: "1 Monat Builder gratis", icon: Gift, earned: (data?.referral_count ?? 0) >= 2 },
    { threshold: 5, label: "Pro Trial freischalten", icon: Star, earned: (data?.referral_count ?? 0) >= 5 },
    { threshold: 10, label: "Lifetime Insider Status", icon: Sparkles, earned: (data?.referral_count ?? 0) >= 10 },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Empfehlungsprogramm – BuildYourBrand" description="Empfehle BuildYourBrand und erhalte kostenlose Upgrades." path="/dashboard/referrals" />
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-2">Empfehlungsprogramm</h1>
        <p className="text-muted-foreground mb-8">Teile BuildYourBrand und erhalte kostenlose Upgrades.</p>

        {/* Referral Link */}
        <div className="rounded-xl border bg-card p-6 mb-6">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">Dein Empfehlungslink</h2>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border bg-card p-5 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-2xl font-bold">{data?.referral_count ?? 0}</p>
            <p className="text-xs text-muted-foreground">Erfolgreiche Empfehlungen</p>
          </div>
          <div className="rounded-xl border bg-accent/5 border-accent/20 p-5 text-center">
            <Gift className="h-5 w-5 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{data?.reward_builder_months ?? 0}</p>
            <p className="text-xs text-muted-foreground">Gratis Builder-Monate</p>
          </div>
        </div>

        {/* Rewards */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-4">Belohnungen</h2>
          <div className="space-y-4">
            {rewards.map(({ threshold, label, icon: Icon, earned }) => (
              <div key={threshold} className={`flex items-center gap-4 p-4 rounded-lg border ${earned ? "bg-accent/5 border-accent/20" : "bg-muted/30"}`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${earned ? "bg-accent/10" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${earned ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${earned ? "text-foreground" : "text-muted-foreground"}`}>{label}</p>
                  <p className="text-xs text-muted-foreground">{threshold} Empfehlungen benötigt</p>
                </div>
                {earned && <Check className="h-5 w-5 text-accent" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
