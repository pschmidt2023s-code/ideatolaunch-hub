import { useState } from "react";
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
import { validatePasswordStrength, checkRateLimit, logSecurityEvent } from "@/lib/security";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Password strength indicator
  const pwValidation = isSignUp ? validatePasswordStrength(password) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    // Rate limit check
    if (!checkRateLimit(`auth_${email}`, 5, 60_000)) {
      toast.error("Zu viele Versuche. Bitte warte eine Minute.");
      return;
    }

    // Password strength check for signup
    if (isSignUp && !validatePasswordStrength(password).isValid) {
      toast.error("Passwort erfüllt nicht die Sicherheitsanforderungen.");
      return;
    }

    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      // Log failed login attempt
      logSecurityEvent("failed_login", {
        email_hint: email.slice(0, 3) + "***",
        is_signup: isSignUp,
        error: error.message,
      });
      toast.error(error.message);
      return;
    }

    if (isSignUp) {
      trackEvent("signup_completed");
      toast.success(t("auth.signupSuccess"));
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={128}
            />

            {/* Password strength meter (signup only) */}
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
          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? t("auth.register") : t("auth.login")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? t("auth.alreadyRegistered") : t("auth.noAccount")}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-foreground hover:underline"
          >
            {isSignUp ? t("auth.login") : t("auth.register")}
          </button>
        </p>

        {/* Security trust signal */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>256-bit SSL · DSGVO-konform · EU-Hosting</span>
        </div>
      </div>
    </div>
  );
}
