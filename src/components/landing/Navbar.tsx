import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Menu, X, ChevronDown } from "lucide-react";

const navLinks = [
  { labelKey: "product", href: "/product" },
  { labelKey: "pricing", href: "#pricing" },
  { labelKey: "tools", href: null }, // dropdown
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
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
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
                    <div className="rounded-lg border bg-card p-2 shadow-lg min-w-[220px]">
                      {toolLinks.map((tool) => (
                        <a
                          key={tool.href}
                          href={tool.href}
                          className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
        <div className="border-t bg-background px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-1">
            <a href="/product" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {isDE ? "Produkt" : "Product"}
            </a>
            <a href="#pricing" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {t("nav.pricing")}
            </a>
            {toolLinks.map((tool) => (
              <a key={tool.href} href={tool.href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors pl-6">
                {isDE ? tool.labelDE : tool.labelEN}
              </a>
            ))}
            <a href="/guide/eigenmarke-gruenden" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Guide</a>
            <a href="/download" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Download</a>
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            <button
              onClick={() => { toggleLang(); setMenuOpen(false); }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {isDE ? "English" : "Deutsch"}
            </button>
            <Button variant="ghost" className="justify-start" onClick={() => { navigate("/auth"); setMenuOpen(false); }}>
              {t("nav.login")}
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
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
