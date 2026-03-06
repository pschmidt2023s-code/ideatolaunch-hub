import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { validatePasswordStrength } from "@/lib/security";
import { ArrowLeft, Loader2, ShieldCheck, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  const pwValidation = validatePasswordStrength(password);

  useEffect(() => {
    // Check if we arrived via recovery link
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pwValidation.isValid) {
      toast.error("Passwort erfüllt nicht die Sicherheitsanforderungen.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Passwort erfolgreich geändert!");
    navigate("/dashboard");
  };

  const strengthColors = ["bg-destructive", "bg-destructive", "bg-yellow-500", "bg-accent", "bg-accent"];
  const strengthLabels = ["Sehr schwach", "Schwach", "Mittel", "Stark", "Sehr stark"];

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <SEO title="Passwort zurücksetzen" description="Setze dein Passwort zurück." path="/reset-password" />
        <div className="text-center space-y-4">
          <KeyRound className="h-12 w-12 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-bold">Ungültiger Link</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Dieser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Passwort-Reset an.
          </p>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Zurück zur Anmeldung
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <SEO title="Neues Passwort setzen" description="Setze dein neues Passwort." path="/reset-password" />
      <button
        onClick={() => navigate("/auth")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <KeyRound className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Neues Passwort</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wähle ein sicheres neues Passwort für dein Konto.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input
              id="password" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} maxLength={128}
            />
            {password.length > 0 && (
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
                  {!pwValidation.isValid && pwValidation.errors.length > 0 && (
                    <span className="ml-1">– {pwValidation.errors[0]}</span>
                  )}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Passwort bestätigen</Label>
            <Input
              id="confirm" type="password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8} maxLength={128}
            />
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwörter stimmen nicht überein</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading || !pwValidation.isValid}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Passwort ändern
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>256-bit SSL · DSGVO-konform · EU-Hosting</span>
        </div>
      </div>
    </div>
  );
}
