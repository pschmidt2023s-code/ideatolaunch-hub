import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t px-4 py-12" role="contentinfo">
      <div className="container mx-auto max-w-5xl flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">B</span>
          </div>
          <span className="font-semibold">BuildYourBrand</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/impressum" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:text-foreground transition-colors">
            Datenschutz
          </Link>
          <Link to="/agb" className="hover:text-foreground transition-colors">
            Nutzungsbedingungen
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} BuildYourBrand. {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
