import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { labelKey: "product", href: "/product" },
  { labelKey: "pricing", href: "#pricing" },
  { labelKey: "tools", href: null },
  { labelKey: "guide", href: "/guide/eigenmarke-gruenden" },
  { labelKey: "download", href: "/download" },
];

const toolLinks = [
  { labelDE: "Produktionskosten Rechner", labelEN: "Production Cost Calculator", href: "/tools/produktionskosten-rechner" },
  { labelDE: "Break-Even Rechner", labelEN: "Break-Even Calculator", href: "/tools/break-even-rechner" },
  { labelDE: "MOQ Rechner", labelEN: "MOQ Calculator", href: "/tools/moq-rechner" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const isDE = i18n.language === "de";

  const toggleLang = () => {
    const next = isDE ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const navLabel = (key: string) => {
    const map: Record<string, [string, string]> = {
      product: ["Produkt", "Product"],
      pricing: [t("nav.pricing"), t("nav.pricing")],
      tools: ["Tools", "Tools"],
      guide: ["Guide", "Guide"],
      download: ["Download", "Download"],
    };
    const pair = map[key];
    return pair ? (isDE ? pair[0] : pair[1]) : key;
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-lg font-semibold">BuildYourBrand</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.href ? (
              <a
                key={link.labelKey}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {navLabel(link.labelKey)}
              </a>
            ) : (
              <div
                key={link.labelKey}
                className="relative"
                onMouseEnter={() => setToolsOpen(true)}
                onMouseLeave={() => setToolsOpen(false)}
              >
                <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {navLabel(link.labelKey)}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {toolsOpen && (
                  <div className="absolute left-0 top-full pt-1 z-50">
                    <div className="rounded-xl border bg-card p-1.5 shadow-lg min-w-[220px]">
                      {toolLinks.map((tool) => (
                        <a
                          key={tool.href}
                          href={tool.href}
                          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {isDE ? tool.labelDE : tool.labelEN}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Globe className="h-4 w-4" />
            {isDE ? "EN" : "DE"}
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            {t("nav.login")}
          </Button>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => navigate("/auth?tab=signup")}
          >
            {isDE ? "Jetzt starten" : "Get started"}
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
        <div className="border-t bg-background px-4 pb-8 pt-3 md:hidden animate-fade-in">
          {/* Main navigation */}
          <nav className="flex flex-col gap-0.5">
            <a href="/product" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {isDE ? "Produkt" : "Product"}
            </a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              {t("nav.pricing")}
            </a>
            <a href="/guide/eigenmarke-gruenden" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Guide
            </a>
            <a href="/download" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors">
              Download
            </a>

            {/* Tools sub-group */}
            <div className="mt-1 mb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1">Tools</p>
            </div>
            {toolLinks.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors pl-5"
              >
                {isDE ? tool.labelDE : tool.labelEN}
              </a>
            ))}
          </nav>

          {/* Divider + secondary actions */}
          <div className="mt-4 flex flex-col gap-1.5 border-t pt-4">
            <button
              onClick={() => { toggleLang(); setMenuOpen(false); }}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {isDE ? "English" : "Deutsch"}
            </button>
            <Button variant="ghost" className="justify-start h-10" onClick={() => { navigate("/auth"); setMenuOpen(false); }}>
              {t("nav.login")}
            </Button>
          </div>

          {/* CTA with bottom safe area */}
          <div className="mt-4 pb-safe">
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => { navigate("/auth?tab=signup"); setMenuOpen(false); }}
            >
              {isDE ? "Jetzt starten" : "Get started"}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
