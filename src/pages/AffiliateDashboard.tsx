import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { Copy, Check, DollarSign, MousePointerClick, TrendingUp, Users, Banknote } from "lucide-react";
import { toast } from "sonner";

interface AffiliateData {
  affiliate_code: string;
  commission_rate: number;
  total_earnings: number;
  total_clicks: number;
  total_conversions: number;
  active_referrals: number;
  payout_status: string;
}

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const load = async () => {
      const { data: existing } = await supabase
        .from("affiliates" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setData(existing as unknown as AffiliateData);
      } else {
        const code = `AFF-${user.id.slice(0, 6).toUpperCase()}`;
        const { data: created } = await supabase
          .from("affiliates" as any)
          .insert({ user_id: user.id, affiliate_code: code })
          .select()
          .single();
        if (created) setData(created as unknown as AffiliateData);
      }
      setLoading(false);
    };
    load();
  }, [user, authLoading, navigate]);

  const affiliateLink = data ? `${window.location.origin}/?aff=${data.affiliate_code}` : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    toast.success("Link kopiert!");
    trackEvent("upgrade_clicked", { source: "affiliate_copy_link" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = [
    { icon: MousePointerClick, label: "Klicks", value: data?.total_clicks ?? 0 },
    { icon: Users, label: "Conversions", value: data?.total_conversions ?? 0 },
    { icon: DollarSign, label: "Einnahmen", value: `${(data?.total_earnings ?? 0).toFixed(2)} €` },
    { icon: TrendingUp, label: "Aktive Refs", value: data?.active_referrals ?? 0 },
  ];

  return (
    <DashboardLayout>
      <SEO title="Affiliate Programm – BuildYourBrand" description="Verdiene 25% wiederkehrende Provision mit dem BuildYourBrand Affiliate-Programm." path="/dashboard/affiliate" />
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-2">Affiliate Programm</h1>
        <p className="text-muted-foreground mb-8">25% wiederkehrende Provision auf alle Builder & Pro Abonnements.</p>

        {/* Affiliate Link */}
        <div className="rounded-xl border bg-card p-6 mb-6">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-3">Dein Affiliate-Link</h2>
          <div className="flex gap-2">
            <Input value={affiliateLink} readOnly className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-5">
              <Icon className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Commission Info */}
        <div className="rounded-xl border bg-card p-6 mb-6">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wide mb-4">Provision</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provisionssatz</span>
              <span className="font-bold text-accent">{data?.commission_rate ?? 25}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provision auf Builder (29€)</span>
              <span className="font-bold">7,25 € / Monat</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Provision auf Pro (79€)</span>
              <span className="font-bold">19,75 € / Monat</span>
            </div>
          </div>
        </div>

        {/* Payout Status */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Auszahlungsstatus</p>
              <p className="text-xs text-muted-foreground capitalize">{data?.payout_status ?? "pending"}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
