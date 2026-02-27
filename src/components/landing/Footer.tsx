import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShieldCheck, Lock, Server } from "lucide-react";

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const { t, i18n } = useTranslation();
  const isDE = i18n.language === "de";

  return (
    <footer ref={ref} className="border-t px-4 py-12" role="contentinfo">
      <div className="container mx-auto max-w-5xl">
        {/* Trust Bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 pb-8 border-b">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>{isDE ? "256-bit SSL-Verschlüsselung" : "256-bit SSL encryption"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-4 w-4 text-accent" />
            <span>{isDE ? "DSGVO-konform" : "GDPR compliant"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Server className="h-4 w-4 text-accent" />
            <span>{isDE ? "EU-Hosting · Made in Germany" : "EU hosting · Made in Germany"}</span>
          </div>
        </div>

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
              <Link to="/case-studies" className="hover:text-foreground transition-colors">
                Case Studies
              </Link>
              <Link to="/community" className="hover:text-foreground transition-colors">
                Community
              </Link>
              <Link to="/press" className="hover:text-foreground transition-colors">
                {isDE ? "Presse" : "Press"}
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{isDE ? "Ressourcen" : "Resources"}</h3>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/academy" className="hover:text-foreground transition-colors">
                Academy
              </Link>
              <Link to="/research" className="hover:text-foreground transition-colors">
                Research
              </Link>
              <Link to="/guide/eigenmarke-gruenden" className="hover:text-foreground transition-colors">
                {isDE ? "Eigenmarke gründen" : "Start your brand"}
              </Link>
              <Link to="/tools/break-even-rechner" className="hover:text-foreground transition-colors">
                {isDE ? "Break-Even Rechner" : "Break-Even Calculator"}
              </Link>
              <Link to="/best-private-label-tools" className="hover:text-foreground transition-colors">
                {isDE ? "Tool-Vergleich" : "Tool Comparison"}
              </Link>
              <Link to="/ueber-uns" className="hover:text-foreground transition-colors">
                {isDE ? "Über uns" : "About"}
              </Link>
            </nav>
          </div>

          {/* Legal & Security */}
          <div>
            <h3 className="font-semibold text-sm mb-3">{isDE ? "Rechtliches & Sicherheit" : "Legal & Security"}</h3>
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
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              {isDE
                ? "Deine Daten werden verschlüsselt in der EU gespeichert. Keine Weitergabe an Dritte."
                : "Your data is encrypted and stored in the EU. No third-party sharing."}
            </p>
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
});
