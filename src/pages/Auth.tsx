import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("tab") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (isSignUp) {
      toast.success("Konto erstellt! Bitte bestätige deine E-Mail.");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück
      </button>

      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">B</span>
          </div>
          <h1 className="text-2xl font-bold">
            {isSignUp ? "Konto erstellen" : "Willkommen zurück"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp
              ? "Starte deine Marke in wenigen Minuten."
              : "Melde dich an, um fortzufahren."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="dein@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? "Registrieren" : "Anmelden"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Bereits registriert?" : "Noch kein Konto?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-foreground hover:underline"
          >
            {isSignUp ? "Anmelden" : "Registrieren"}
          </button>
        </p>
      </div>
    </div>
  );
}
