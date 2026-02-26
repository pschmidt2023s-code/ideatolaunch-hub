import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { Users, Lightbulb, BookOpen, Zap, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Community() {
  const [email, setEmail] = useState("");
  const [niche, setNiche] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || saving) return;
    setSaving(true);

    try {
      await supabase.from("community_waitlist" as any).insert({ email, niche: niche || null });
      trackEvent("upgrade_clicked", { source: "community_waitlist", niche });
    } catch { /* silent */ }

    setSaving(false);
    setSubmitted(true);
    toast.success("Du bist auf der Warteliste!");
  };

  const benefits = [
    { icon: Users, title: "Exklusives Netzwerk", desc: "Vernetze dich mit ambitionierten Gründern im DACH-Raum." },
    { icon: MessageCircle, title: "Direkter Austausch", desc: "Stelle Fragen, teile Erfahrungen und lerne von anderen." },
    { icon: BookOpen, title: "Case Study Sharing", desc: "Teile deinen Fortschritt und lerne aus echten Launches." },
    { icon: Zap, title: "Early Feature Access", desc: "Teste neue Features vor allen anderen und gib Feedback." },
    { icon: Lightbulb, title: "Experten-Sessions", desc: "Regelmäßige Q&A Sessions mit E-Commerce Experten." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Gründer Community – BuildYourBrand"
        description="Werde Teil der BuildYourBrand Gründer Community. Networking, Case Studies, Early Access und direkter Austausch."
        path="/community"
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          {/* Hero */}
          <section className="mb-14 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
              Die Gründer-Community für{" "}
              <span className="text-gradient">Eigenmarken-Builder</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Tritt der exklusiven Community bei – vernetze dich, lerne von echten Gründern und erhalte Early Access auf neue Features.
            </p>
          </section>

          {/* Benefits */}
          <section className="mb-14">
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl border bg-card p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-bold mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Waitlist Form */}
          <section className="rounded-2xl border bg-card p-8 md:p-10">
            {!submitted ? (
              <>
                <h2 className="text-xl font-bold mb-2 text-center">Tritt der Warteliste bei</h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Sei unter den Ersten, wenn die Community startet.
                </p>
                <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-3">
                  <Input
                    type="email"
                    placeholder="Deine E-Mail-Adresse"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                  <Input
                    type="text"
                    placeholder="Deine Nische (optional)"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="h-11"
                  />
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    {saving ? "Wird gesendet..." : "Auf die Warteliste"}
                  </Button>
                </form>
                <p className="mt-3 text-xs text-muted-foreground text-center">Kein Spam. Jederzeit abmeldbar.</p>
              </>
            ) : (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
                <h2 className="text-xl font-bold mb-2">Du bist dabei! 🎉</h2>
                <p className="text-sm text-muted-foreground">Wir melden uns, sobald die Community startet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
