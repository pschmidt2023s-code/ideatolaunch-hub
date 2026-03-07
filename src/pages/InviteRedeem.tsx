import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Gift, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function InviteRedeem() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { user, loading: authLoading, signUp, signIn } = useAuth();

  const [step, setStep] = useState<"loading" | "signup" | "redeeming" | "done" | "error">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ plan: string; license_key: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pendingRedeem = useRef(false);

  const PLAN_LABELS: Record<string, string> = {
    builder: "Builder",
    pro: "Pro",
    execution: "Execution OS",
    trading: "Trading",
  };

  // Auto-redeem when user session becomes available after signup
  useEffect(() => {
    if (user && pendingRedeem.current) {
      pendingRedeem.current = false;
      redeemInvite();
    }
  }, [user]);

  // Check token validity
  useEffect(() => {
    if (!token) {
      setStep("error");
      setErrorMsg("Kein Einladungs-Token gefunden.");
      return;
    }

    const checkToken = async () => {
      const { data } = await supabase
        .from("license_invitations")
        .select("id, plan, status, expires_at")
        .eq("token", token)
        .eq("status", "active")
        .maybeSingle();

      if (!data) {
        setStep("error");
        setErrorMsg("Einladung nicht gefunden oder bereits verwendet.");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setStep("error");
        setErrorMsg("Diese Einladung ist abgelaufen.");
        return;
      }

      if (!authLoading && user) {
        redeemInvite();
      } else if (!authLoading) {
        setStep("signup");
      }
    };

    if (!authLoading) checkToken();
  }, [token, authLoading, user]);

  const redeemInvite = async () => {
    setStep("redeeming");
    try {
      const res = await supabase.functions.invoke("redeem-invite", {
        body: { token },
      });

      if (res.error || res.data?.error) {
        setStep("error");
        setErrorMsg(res.data?.error || res.error?.message || "Fehler beim Einlösen");
        return;
      }

      setResult(res.data);
      setStep("done");
      toast.success("Einladung erfolgreich eingelöst!");
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

      // With auto-confirm, session is immediately available.
      pendingRedeem.current = true;
      setStep("redeeming");
    } catch {
      setSubmitting(false);
    }
  };

  if (step === "loading") {
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
          <h1 className="text-xl font-bold">Einladung ungültig</h1>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Zur Startseite
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
          <p className="text-sm text-muted-foreground">Einladung wird eingelöst…</p>
        </div>
      </div>
    );
  }

  // Signup/Login form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Gift className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold">Du wurdest eingeladen!</h1>
          <p className="text-sm text-muted-foreground">
            {isLogin
              ? "Melde dich an, um deine Einladung einzulösen."
              : "Schnell registrieren — keine Bestätigung nötig."}
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
