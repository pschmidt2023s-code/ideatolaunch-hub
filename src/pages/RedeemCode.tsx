import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Gift, Check, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

export default function RedeemCode() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillCode = searchParams.get("code") || "";
  const { user, loading: authLoading, signUp, signIn } = useAuth();

  const [code, setCode] = useState(prefillCode.toUpperCase());
  const [step, setStep] = useState<"enter" | "auth" | "redeeming" | "done" | "error">("enter");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ plan: string; license_key: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pendingRedeem = useRef<string | null>(null);

  const PLAN_LABELS: Record<string, string> = {
    builder: "Builder",
    pro: "Pro",
    execution: "Execution OS",
    trading: "Trading",
  };

  // Auto-redeem when user session becomes available and we have a pending code
  useEffect(() => {
    if (user && pendingRedeem.current) {
      const codeToRedeem = pendingRedeem.current;
      pendingRedeem.current = null;
      redeemCode(codeToRedeem);
    }
  }, [user]);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    if (user) {
      await redeemCode(trimmed);
    } else {
      setStep("auth");
    }
  };

  const redeemCode = async (shortCode: string) => {
    setStep("redeeming");
    try {
      const res = await supabase.functions.invoke("redeem-invite", {
        body: { short_code: shortCode },
      });

      if (res.error || res.data?.error) {
        setStep("error");
        setErrorMsg(res.data?.error || res.error?.message || "Fehler beim Einlösen");
        return;
      }

      setResult(res.data);
      setStep("done");
      toast.success("Code erfolgreich eingelöst!");
    } catch (e: any) {
      setStep("error");
      setErrorMsg(e.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
          setSubmitting(false);
          return;
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
          setSubmitting(false);
          return;
        }
      }

      // With auto-confirm, session is available immediately.
      // Set pending code so the useEffect triggers redeem on session.
      pendingRedeem.current = code.trim().toUpperCase();
      setStep("redeeming");
    } catch {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Code ungültig</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button onClick={() => { setStep("enter"); setErrorMsg(""); }} variant="outline">
            Erneut versuchen
          </Button>
        </div>
      </div>
    );
  }

  if (step === "done" && result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Willkommen! 🎉</h1>
          <p className="text-sm text-muted-foreground">
            Dein <strong>{PLAN_LABELS[result.plan] ?? result.plan}</strong>-Plan ist aktiv.
          </p>
          {result.license_key && (
            <div className="rounded-lg border bg-card p-3">
              <p className="text-[11px] text-muted-foreground mb-1">Dein Lizenzschlüssel</p>
              <code className="text-sm font-mono font-bold">{result.license_key}</code>
            </div>
          )}
          <Button onClick={() => navigate("/dashboard")} className="w-full">
            Zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (step === "redeeming") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Code wird eingelöst…</p>
        </div>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <SEO title="Code einlösen" description="Löse deinen Einladungscode ein." path="/redeem" />
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Gift className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Code: {code.trim().toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Melde dich an, um den Code einzulösen." : "Schnell registrieren — keine Bestätigung nötig."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label>E-Mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deine@email.de" required />
            </div>
            <div className="space-y-2">
              <Label>Passwort</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isLogin ? "Dein Passwort" : "Mind. 8 Zeichen"} required minLength={8} />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLogin ? "Anmelden & einlösen" : "Registrieren & einlösen"}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Noch kein Account?" : "Bereits registriert?"}{" "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline">
              {isLogin ? "Registrieren" : "Anmelden"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Step: enter code
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <SEO title="Code einlösen" description="Löse deinen Einladungscode ein und erhalte sofort Zugang." path="/redeem" />
      <button
        onClick={() => navigate("/")}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Einladungscode einlösen</h1>
          <p className="text-sm text-muted-foreground">
            Gib deinen Code ein und erhalte sofort Zugang.
          </p>
        </div>

        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Einladungscode</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="z.B. VIP-3F7A"
              className="text-center text-lg font-mono font-bold tracking-widest"
              maxLength={10}
              required
            />
          </div>
          <Button type="submit" className="w-full gap-2">
            <Gift className="h-4 w-4" /> Code einlösen
          </Button>
        </form>
      </div>
    </div>
  );
}
