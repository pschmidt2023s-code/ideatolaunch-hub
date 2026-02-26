import { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface GuideLayoutProps {
  title: string;
  seoTitle: string;
  seoDescription: string;
  path: string;
  breadcrumbs: BreadcrumbItem[];
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  children: ReactNode;
}

export function GuideLayout({ title, seoTitle, seoDescription, path, breadcrumbs, jsonLd, children }: GuideLayoutProps) {
  const navigate = useNavigate();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `https://brand.aldenairperfumes.de${item.href}`
    }))
  };

  const allJsonLd = jsonLd
    ? Array.isArray(jsonLd) ? [breadcrumbJsonLd, ...jsonLd] : [breadcrumbJsonLd, jsonLd]
    : breadcrumbJsonLd;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={seoTitle} description={seoDescription} path={path} jsonLd={allJsonLd} />
      <Navbar />
      <main className="px-4 pt-28 pb-20">
        <article className="container mx-auto max-w-3xl">
          {/* Breadcrumb navigation */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            {breadcrumbs.map((item, i) => (
              <span key={item.href} className="flex items-center gap-2">
                {i > 0 && <span>/</span>}
                {i < breadcrumbs.length - 1 ? (
                  <Link to={item.href} className="hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.name}</span>
                )}
              </span>
            ))}
          </nav>

          {children}

          {/* Bottom CTA */}
          <section className="mt-16 rounded-2xl border bg-card p-8 text-center md:p-12">
            <h2 className="text-2xl font-bold mb-3 md:text-3xl">Bereit, deine Eigenmarke zu starten?</h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              BuildYourBrand begleitet dich von der Idee bis zum Launch – strukturiert, datengetrieben und mit KI-Unterstützung.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Kostenlos starten <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
                Preise ansehen
              </Button>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
