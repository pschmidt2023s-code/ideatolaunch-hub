import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <footer className="border-t px-4 py-12" role="contentinfo">
      <div className="container mx-auto max-w-5xl">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">B</span>
              </div>
              <span className="font-semibold">BuildYourBrand</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isDE
                ? "Die SaaS-Plattform für strukturierten Markenaufbau – von der Idee bis zum Launch."
                : "The SaaS platform for structured brand building – from idea to launch."}
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{isDE ? "Produkt" : "Product"}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/#features" className="hover:text-foreground transition-colors">
                {t("nav.features")}
              </Link>
              <Link to="/pricing" className="hover:text-foreground transition-colors">
                {t("nav.pricing")}
              </Link>
              <Link to="/product" className="hover:text-foreground transition-colors">
                {isDE ? "Premium Desk Mat" : "Premium Desk Mat"}
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{isDE ? "Ressourcen" : "Resources"}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link to="/blog/minimalistischer-arbeitsplatz" className="hover:text-foreground transition-colors">
                {isDE ? "Workspace Guide" : "Workspace Guide"}
              </Link>
              <Link to="/blog/produktivitaet-home-office" className="hover:text-foreground transition-colors">
                {isDE ? "Produktivität" : "Productivity"}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{isDE ? "Rechtliches" : "Legal"}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/impressum" className="hover:text-foreground transition-colors">
                Impressum
              </Link>
              <Link to="/datenschutz" className="hover:text-foreground transition-colors">
                {isDE ? "Datenschutz" : "Privacy"}
              </Link>
              <Link to="/agb" className="hover:text-foreground transition-colors">
                {isDE ? "Nutzungsbedingungen" : "Terms"}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BuildYourBrand. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
