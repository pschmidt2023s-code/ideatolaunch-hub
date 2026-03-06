import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { checkRateLimit } from "@/lib/security";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    if (!checkRateLimit(`reset_${email}`, 3, 120_000)) {
      toast.error("Zu viele Versuche. Bitte warte 2 Minuten.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
          <Mail className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-lg font-bold">E-Mail gesendet</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Falls ein Konto mit <strong>{email}</strong> existiert, erhältst du eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.
        </p>
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Zurück zur Anmeldung
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold">Passwort vergessen?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gib deine E-Mail-Adresse ein und wir senden dir einen Reset-Link.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">E-Mail-Adresse</Label>
          <Input
            id="reset-email" type="email" placeholder="deine@email.de"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required maxLength={255}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset-Link senden
        </Button>
      </form>
    </div>
  );
}
