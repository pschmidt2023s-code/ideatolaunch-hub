import { SEO } from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "BuildYourBrand Blog",
  "description": "Guides, Strategien und Insider-Tipps für Gründer: Markenaufbau, Produktivität, Workspace-Design.",
  "url": "https://brand.aldenairperfumes.de/blog",
  "blogPost": articles.map(a => ({
    "@type": "BlogPosting",
    "headline": a.title,
    "description": a.description,
    "datePublished": a.date,
    "url": `https://brand.aldenairperfumes.de/blog/${a.slug}`,
    "author": { "@type": "Organization", "name": "BuildYourBrand" },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brand.aldenairperfumes.de/" },
    { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://brand.aldenairperfumes.de/blog" },
  ],
};

export default function Blog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog – Markenaufbau & Workspace Tipps"
        description="Guides, Strategien und Insider-Tipps für Gründer: Markenaufbau, Produktivität, Workspace-Design. Kostenlos lesen."
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

          {/* CTA to pricing */}
          <div className="mt-16 rounded-xl border bg-card p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Bereit, deine Marke zu starten?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Von der Idee zum Launch – strukturiert und datengetrieben.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Kostenlos starten <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/pricing")}>
                Preise ansehen
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
