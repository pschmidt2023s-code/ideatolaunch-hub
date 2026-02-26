import { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolPageLayoutProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  path: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  introContent: ReactNode;
  children: ReactNode;
  faqContent?: ReactNode;
}

export function ToolPageLayout({ title, seoTitle, seoDescription, path, jsonLd, introContent, children, faqContent }: ToolPageLayoutProps) {
  const navigate = useNavigate();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://brand.aldenairperfumes.de/" },
      { "@type": "ListItem", "position": 2, "name": "Tools", "item": `https://brand.aldenairperfumes.de/tools` },
      { "@type": "ListItem", "position": 3, "name": title, "item": `https://brand.aldenairperfumes.de${path}` },
    ]
  };

  const allJsonLd = jsonLd
    ? Array.isArray(jsonLd) ? [breadcrumbJsonLd, ...jsonLd] : [breadcrumbJsonLd, jsonLd]
    : breadcrumbJsonLd;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={seoTitle} description={seoDescription} path={path} jsonLd={allJsonLd} />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <div className="container mx-auto max-w-3xl">
          {/* SEO intro content above tool */}
          {introContent}

          {/* Calculator tool */}
          <div className="my-12">
            {children}
          </div>

          {/* Pro upgrade CTA */}
          <section className="rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-8 text-center my-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Lock className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold">Erweiterte Analyse freischalten</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Mit dem Pro-Plan erhältst du Szenario-Simulationen, Lieferanten-Matching und KI-gestützte Risikoanalysen.
            </p>
            <Button
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate("/pricing")}
            >
              Pro-Plan entdecken <ArrowRight className="h-4 w-4" />
            </Button>
          </section>

          {/* FAQ */}
          {faqContent}

          {/* Bottom CTA */}
          <section className="mt-12 rounded-2xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold mb-3">Mehr als nur ein Rechner</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto text-sm">
              BuildYourBrand bietet den kompletten Markenaufbau-Workflow – von der Kalkulation bis zum Launch.
            </p>
            <Button
              size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
