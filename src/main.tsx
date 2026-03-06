import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installGlobalErrorHandler, trackPageLoad } from "./lib/analytics";

// HashRouter compat: normalize direct deep links like /admin/dashboard -> /#/admin/dashboard
// while preserving preview token query params (e.g. ?__lovable_token=...).
if (typeof window !== "undefined") {
  const { origin, pathname, search, hash } = window.location;
  if (pathname !== "/" && !hash) {
    window.history.replaceState(null, "", `${origin}/${search}#${pathname}`);
  }
}

installGlobalErrorHandler();
trackPageLoad();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
