import { ShieldCheck, Lock, Server, Eye, CheckCircle2 } from "lucide-react";

export function TrustSection() {
  const trustItems = [
    {
      icon: ShieldCheck,
      title: "Enterprise-Grade Security",
      desc: "256-bit SSL-Verschlüsselung, Content Security Policy, HTTP Security Headers und Rate Limiting schützen deine Daten.",
    },
    {
      icon: Lock,
      title: "DSGVO-konform",
      desc: "Vollständige Einhaltung der EU-Datenschutzverordnung. Deine Daten werden ausschließlich in der EU gespeichert.",
    },
    {
      icon: Server,
      title: "EU-Hosting",
      desc: "Infrastruktur komplett in Europa gehostet. Keine Datenübertragung in Drittländer. Made in Germany.",
    },
    {
      icon: Eye,
      title: "Transparenz",
      desc: "Offene Preise, klare Datenschutzrichtlinien, kein Tracking ohne Einwilligung. Du behältst die volle Kontrolle.",
    },
  ];

  return (
    <section className="px-4 py-16 border-t" id="security">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
            <ShieldCheck className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Sicherheit auf Enterprise-Niveau</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Deine Geschäftsdaten verdienen den höchsten Schutz. BuildYourBrand setzt auf die gleichen Sicherheitsstandards wie führende SaaS-Unternehmen.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-bold text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          {["SSL/TLS", "HSTS", "CSP Headers", "Rate Limiting", "Input Validation", "DSGVO"].map(tag => (
            <span key={tag} className="flex items-center gap-1.5 rounded-full border px-3 py-1">
              <CheckCircle2 className="h-3 w-3 text-accent" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
