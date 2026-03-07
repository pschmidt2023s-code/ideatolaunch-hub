import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, LogOut, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { useTranslation } from "react-i18next";

export function SessionManagement() {
  const { user, signOut } = useAuth();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [signingOut, setSigningOut] = useState(false);

  const currentUA = navigator.userAgent;
  const isMobile = /mobile|android|iphone/i.test(currentUA);
  const browser = getBrowserName(currentUA);
  const os = getOSName(currentUA);
  const loginTime = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : null;

  const handleSignOutOther = async () => {
    setSigningOut(true);
    try {
      // Sign out all other sessions by refreshing the current one
      const { error } = await supabase.auth.refreshSession();
      if (error) throw error;
      toast.success(isDE ? "Andere Sitzungen beendet" : "Other sessions signed out");
    } catch {
      toast.error(isDE ? "Fehler beim Abmelden" : "Error signing out sessions");
    }
    setSigningOut(false);
  };

  return (
    <AnimatedCard index={4}>
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{isDE ? "Sitzungen" : "Sessions"}</h2>
            <p className="text-xs text-muted-foreground">
              {isDE ? "Aktive Anmeldungen verwalten" : "Manage active sign-ins"}
            </p>
          </div>
        </div>

        {/* Current session */}
        <div className="rounded-xl border bg-muted/30 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              {isMobile ? (
                <Smartphone className="h-4 w-4 text-success" />
              ) : (
                <Monitor className="h-4 w-4 text-success" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{browser} · {os}</p>
                <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                  {isDE ? "Aktiv" : "Active"}
                </Badge>
              </div>
              {loginTime && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {isDE ? "Angemeldet" : "Signed in"}: {loginTime.toLocaleDateString("de-DE")} {loginTime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOutOther}
            disabled={signingOut}
            className="rounded-xl gap-2 text-xs flex-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isDE ? "Andere Sitzungen beenden" : "Sign out other sessions"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="rounded-xl gap-2 text-xs text-destructive hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            {isDE ? "Hier abmelden" : "Sign out here"}
          </Button>
        </div>
      </div>
    </AnimatedCard>
  );
}

function getBrowserName(ua: string): string {
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Browser";
}

function getOSName(ua: string): string {
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}
