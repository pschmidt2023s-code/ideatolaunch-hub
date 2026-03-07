import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";
import {
  validatePasswordStrength,
  checkRateLimit,
  logSecurityEvent,
  checkAccountLock,
  recordFailedLogin,
  resetFailedLogins,
  isValidEmail,
} from "@/lib/security";
import { ForgotPassword } from "@/components/ForgotPassword";
import { isKnownDevice, storeFingerprint } from "@/lib/device-fingerprint";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const pwValidation = isSignUp ? validatePasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) return;

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    // Brute force check
    const lockStatus = checkAccountLock(trimmedEmail);
    if (lockStatus.locked) {
      const minutes = Math.ceil(lockStatus.remainingMs / 60_000);
      toast.error(`Account vorübergehend gesperrt. Versuche es in ${minutes} Minuten erneut.`);
      logSecurityEvent("account_locked", { email_hint: trimmedEmail.slice(0, 3) + "***", remaining_minutes: minutes });
      return;
    }

    // Rate limit check
    if (!checkRateLimit(`auth_${trimmedEmail}`, 5, 60_000)) {
      toast.error("Zu viele Versuche. Bitte warte eine Minute.");
      return;
    }

    // Password policy for signups
    if (isSignUp && !validatePasswordStrength(trimmedPassword).isValid) {
      toast.error("Passwort erfüllt nicht die Sicherheitsanforderungen.");
      return;
    }

    setLoading(true);

    const { error } = isSignUp
      ? await signUp(trimmedEmail, trimmedPassword)
      : await signIn(trimmedEmail, trimmedPassword);

    setLoading(false);

    if (error) {
      recordFailedLogin(trimmedEmail);
      logSecurityEvent("failed_login", {
        email_hint: trimmedEmail.slice(0, 3) + "***",
        is_signup: isSignUp,
        error: error.message,
      });

      // Log to login_attempts table
      try {
        await supabase.from("login_attempts" as any).insert({
          email_hint: trimmedEmail.slice(0, 3) + "***@" + trimmedEmail.split("@")[1],
          success: false,
          user_agent_hint: navigator.userAgent.slice(0, 100),
        } as any);
      } catch { /* non-critical */ }

      toast.error(error.message);
      return;
    }

    // Successful login – reset brute force counter
    resetFailedLogins(trimmedEmail);

    // Device fingerprint & login notification
    try {
      const { known, fingerprint } = await isKnownDevice();
      storeFingerprint(fingerprint);

      await supabase.from("login_attempts" as any).insert({
        email_hint: trimmedEmail.slice(0, 3) + "***@" + trimmedEmail.split("@")[1],
        success: true,
        user_agent_hint: navigator.userAgent.slice(0, 100),
      } as any);

      // Notify on new device (non-blocking)
      if (!known && !isSignUp) {
        supabase.functions.invoke("login-notification", {
          body: { device_fingerprint: fingerprint, is_new_device: true },
        }).catch(() => {});
      }
    } catch { /* non-critical */ }

    if (isSignUp) {
      trackEvent("signup_completed");
      if (inviteCode.trim()) {
        toast.success("Account erstellt! Code wird eingelöst…");
        setTimeout(async () => {
          try {
            const res = await supabase.functions.invoke("redeem-invite", {
              body: { short_code: inviteCode.trim().toUpperCase() },
            });
            if (res.data?.success) {
              toast.success(`${res.data.plan}-Plan aktiviert! 🎉`);
              navigate("/dashboard");
            } else {
              toast.error(res.data?.error || "Code konnte nicht eingelöst werden");
              navigate("/onboarding");
            }
          } catch {
            navigate("/onboarding");
          }
        }, 1500);
      } else {
        toast.success(t("auth.signupSuccess"));
      }
    } else {
      navigate("/onboarding");
    }
  };

  const strengthColors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-accent", "bg-accent"];
  const strengthLabels = ["Sehr schwach", "Schwach", "Mittel", "Stark", "Sehr stark"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <SEO
        title="Anmelden"
        description="Melde dich bei BuildYourBrand an oder erstelle ein kostenloses Konto, um deine Marke strukturiert aufzubauen."
        path="/auth"
      />
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.back")}
      </button>

      <div className="w-full max-w-sm">
        {showForgot ? (
          <ForgotPassword onBack={() => setShowForgot(false)} />
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-primary-foreground">B</span>
              </div>
              <h1 className="text-2xl font-bold">
                {isSignUp ? t("auth.createAccount") : t("auth.welcome")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isSignUp ? t("auth.signupDesc") : t("auth.loginDesc")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email" type="email" placeholder={t("auth.emailPlaceholder")}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required maxLength={255} autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-xs text-accent hover:underline"
                    >
                      Passwort vergessen?
                    </button>
                  )}
                </div>
                <Input
                  id="password" type="password" placeholder={t("auth.passwordPlaceholder")}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={8} maxLength={128}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />

                {isSignUp && password.length > 0 && pwValidation && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= pwValidation.score ? strengthColors[pwValidation.score] : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${pwValidation.isValid ? "text-accent" : "text-muted-foreground"}`}>
                      {strengthLabels[pwValidation.score]}
                      {pwValidation.errors.length > 0 && !pwValidation.isValid && (
                        <span className="ml-1">– {pwValidation.errors[0]}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Einladungscode (optional)</Label>
                  <Input
                    id="inviteCode"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, ""))}
                    placeholder="z.B. VIP-3F7A"
                    className="font-mono tracking-wider"
                    maxLength={10}
                    autoComplete="off"
                  />
                </div>
              )}
              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? t("auth.register") : t("auth.login")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? t("auth.alreadyRegistered") : t("auth.noAccount")}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-foreground hover:underline">
                {isSignUp ? t("auth.login") : t("auth.register")}
              </button>
            </p>
          </>
        )}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>256-bit SSL · DSGVO-konform · EU-Hosting</span>
        </div>
      </div>
    </div>
  );
}
