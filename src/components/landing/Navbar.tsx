import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X } from "lucide-react";

export function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    const next = i18n.language === "de" ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-lg font-semibold">BuildYourBrand</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.features")}
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {t("nav.pricing")}
          </a>
          <a href="/guide/eigenmarke-gruenden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Guide
          </a>
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Blog
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-4 w-4" />
            {i18n.language === "de" ? "EN" : "DE"}
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            {t("nav.login")}
          </Button>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {t("nav.signup")}
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-2">
            <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">{t("nav.features")}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">{t("nav.pricing")}</a>
            <a href="/guide/eigenmarke-gruenden" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Guide</a>
            <a href="/blog" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Blog</a>
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            <button
              onClick={() => { toggleLang(); setMenuOpen(false); }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {i18n.language === "de" ? "English" : "Deutsch"}
            </button>
            <Button variant="ghost" className="justify-start" onClick={() => { navigate("/auth"); setMenuOpen(false); }}>
              {t("nav.login")}
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => { navigate("/auth?tab=signup"); setMenuOpen(false); }}
            >
              {t("nav.signup")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
