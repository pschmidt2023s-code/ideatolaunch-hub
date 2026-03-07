import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard } from "@/components/dashboard/AnimatedCard";
import { Shield, ShieldCheck, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function TwoFactorSetup() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  const [step, setStep] = useState<"idle" | "enrolling" | "verifying" | "enabled">("idle");
  const [qrUri, setQrUri] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Check if MFA is already enrolled
  useState(() => {
    if (!user) return;
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find(f => f.status === "verified");
      if (totp) {
        setMfaEnabled(true);
        setStep("enabled");
        setFactorId(totp.id);
      }
    });
  });

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "BrandOS Authenticator",
      });
      if (error) throw error;
      setQrUri(data.totp.uri);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("enrolling");
    } catch (err: any) {
      toast.error(err.message || "MFA enrollment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      toast.error(isDE ? "Bitte 6-stelligen Code eingeben" : "Enter 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });
      if (verify.error) throw verify.error;

      setMfaEnabled(true);
      setStep("enabled");
      toast.success(isDE ? "2FA erfolgreich aktiviert! 🔒" : "2FA enabled successfully! 🔒");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setMfaEnabled(false);
      setStep("idle");
      setFactorId("");
      toast.success(isDE ? "2FA deaktiviert" : "2FA disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedCard index={3}>
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              {mfaEnabled ? (
                <ShieldCheck className="h-5 w-5 text-accent" />
              ) : (
                <Shield className="h-5 w-5 text-accent" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isDE ? "Zwei-Faktor-Authentifizierung" : "Two-Factor Authentication"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isDE ? "Schütze dein Konto mit TOTP" : "Protect your account with TOTP"}
              </p>
            </div>
          </div>
          {mfaEnabled && (
            <Badge className="bg-accent/10 text-accent rounded-lg px-3 py-1 text-xs font-semibold">
              {isDE ? "Aktiv" : "Active"}
            </Badge>
          )}
        </div>

        {step === "idle" && (
          <Button onClick={handleEnroll} disabled={loading} className="gap-2 rounded-xl">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Shield className="h-4 w-4" />
            {isDE ? "2FA aktivieren" : "Enable 2FA"}
          </Button>
        )}

        {step === "enrolling" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isDE
                ? "Scanne den QR-Code mit deiner Authenticator-App (Google Authenticator, Authy, etc.):"
                : "Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.):"}
            </p>

            {/* QR Code via URI */}
            <div className="flex justify-center p-4 bg-white rounded-xl">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUri)}`}
                alt="TOTP QR Code"
                className="w-48 h-48"
              />
            </div>

            {/* Manual secret */}
            <div className="space-y-2">
              <Label className="text-xs">
                {isDE ? "Oder gib diesen Code manuell ein:" : "Or enter this code manually:"}
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-xl border bg-muted/30 px-3 py-2 font-mono text-xs tracking-wider select-all break-all">
                  {secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret} className="shrink-0 rounded-xl">
                  {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Verification */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                {isDE ? "Bestätigungscode eingeben:" : "Enter verification code:"}
              </Label>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="font-mono text-center text-lg tracking-[0.5em] rounded-xl"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleVerify} disabled={loading || verifyCode.length !== 6} className="gap-2 rounded-xl">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDE ? "Bestätigen & Aktivieren" : "Verify & Activate"}
              </Button>
              <Button variant="outline" onClick={() => setStep("idle")} className="rounded-xl">
                {isDE ? "Abbrechen" : "Cancel"}
              </Button>
            </div>
          </div>
        )}

        {step === "enabled" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isDE
                ? "Dein Konto ist durch Zwei-Faktor-Authentifizierung geschützt."
                : "Your account is protected with two-factor authentication."}
            </p>
            <Button variant="outline" onClick={handleUnenroll} disabled={loading} className="gap-2 rounded-xl text-destructive hover:text-destructive">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isDE ? "2FA deaktivieren" : "Disable 2FA"}
            </Button>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
