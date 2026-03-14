import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Menu, ChevronDown } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { labelKey: "product", href: "/product" },
  { labelKey: "pricing", href: "/pricing" },
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
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const isDE = i18n.language === "de";

  const toggleLang = () => {
    const next = isDE ? "en" : "de";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleNav = (path: string) => {
    if (path.startsWith("#")) {
      const el = document.querySelector(path);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(path);
    }
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMenuOpen(false);
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
    <header className="fixed top-0 z-[90] w-full border-b bg-background/80 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="text-lg font-semibold font-display">BuildYourBrand</span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) =>
            link.href ? (
              <button
                key={link.labelKey}
                onClick={() => handleNav(link.href!)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {navLabel(link.labelKey)}
              </button>
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
                        <button
                          key={tool.href}
                          onClick={() => {
                            handleNav(tool.href);
                            setToolsOpen(false);
                          }}
                          className="block w-full text-left rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {isDE ? tool.labelDE : tool.labelEN}
                        </button>
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

          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                {isDE ? "Dashboard" : "Dashboard"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                {isDE ? "Abmelden" : "Sign out"}
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
            aria-label={isDE ? "Menü öffnen" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Menu className="h-5 w-5" />
          </button>

          <SheetContent side="right" className="w-[85vw] max-w-xs border-l bg-background p-0 md:hidden flex flex-col">
            <div className="flex items-center gap-2 px-5 pt-5 pb-3 border-b border-border">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <span className="text-xs font-bold text-primary-foreground">B</span>
              </div>
              <span className="text-base font-semibold font-display">BuildYourBrand</span>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="flex flex-col gap-0.5">
                <button onClick={() => handleNav("/product")} className="rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors">
                  {isDE ? "Produkt" : "Product"}
                </button>
                <button onClick={() => handleNav("/pricing")} className="rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors">
                  {t("nav.pricing")}
                </button>
                <button onClick={() => handleNav("/guide/eigenmarke-gruenden")} className="rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors">
                  Guide
                </button>
                <button onClick={() => handleNav("/download")} className="rounded-lg px-3 py-3 text-left text-[15px] font-medium text-foreground hover:bg-muted active:bg-muted/80 transition-colors">
                  Download
                </button>

                <div className="mt-3 mb-1 px-3">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">Tools</p>
                </div>
                {toolLinks.map((tool) => (
                  <button
                    key={tool.href}
                    onClick={() => handleNav(tool.href)}
                    className="rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 transition-colors pl-5"
                  >
                    {isDE ? tool.labelDE : tool.labelEN}
                  </button>
                ))}
              </nav>

              <div className="mt-5 flex flex-col gap-1 border-t border-border pt-4">
                <button
                  onClick={() => {
                    toggleLang();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  {isDE ? "English" : "Deutsch"}
                </button>

                {user ? (
                  <>
                    <Button variant="ghost" className="justify-start h-11 text-[15px]" onClick={() => handleNav("/dashboard")}>
                      {isDE ? "Zum Dashboard" : "Go to Dashboard"}
                    </Button>
                    <Button variant="outline" className="justify-start h-11 text-[15px]" onClick={handleSignOut}>
                      {isDE ? "Abmelden" : "Sign out"}
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="justify-start h-11 text-[15px]" onClick={() => { navigate("/auth"); setMenuOpen(false); }}>
                    {t("nav.login")}
                  </Button>
                )}
              </div>
            </div>

            {!user && (
              <div className="px-4 py-4 border-t border-border pb-safe">
                <Button
                  className="w-full h-12 text-[15px] bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => {
                    navigate("/auth?tab=signup");
                    setMenuOpen(false);
                  }}
                >
                  {isDE ? "Jetzt starten" : "Get started"}
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
