import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const articles = [
  {
    slug: "minimalistischer-arbeitsplatz",
    title: "Minimalistischer Arbeitsplatz 2026 – Der Fokus Guide",
    description: "Wie du mit Minimalismus am Schreibtisch fokussierter, produktiver und kreativer wirst. Konkrete Tipps für 2026.",
    date: "2026-02-20",
  },
  {
    slug: "produktivitaet-home-office",
    title: "Produktivität im Home Office steigern – 7 wissenschaftlich belegte Prinzipien",
    description: "Wissenschaftlich fundierte Methoden, um im Home Office effektiver zu arbeiten. Von Deep Work bis Environment Design.",
    date: "2026-02-18",
  },
  {
    slug: "schreibtisch-setup-guide",
    title: "Schreibtisch Setup Guide – So baust du dir einen High-Performance Workspace",
    description: "Der komplette Guide für ein professionelles Schreibtisch-Setup: Monitor, Tastatur, Desk Mat und Ergonomie.",
    date: "2026-02-15",
  },
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog – Workspace & Produktivität"
        description="Tipps und Guides für deinen perfekten Workspace: Minimalismus, Produktivität, Schreibtisch-Setups und mehr."
        path="/blog"
      />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Guides, Insights und Strategien rund um Workspace-Design, Produktivität und Premium-Markenaufbau.
          </p>

          <div className="space-y-6">
            {articles.map((a) => (
              <Link
                key={a.slug}
                to={`/blog/${a.slug}`}
                className="group block rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-accent/30"
              >
                <time className="text-xs text-muted-foreground">{a.date}</time>
                <h2 className="mt-2 text-xl font-bold group-hover:text-accent transition-colors">{a.title}</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{a.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-accent font-medium">
                  Weiterlesen <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
