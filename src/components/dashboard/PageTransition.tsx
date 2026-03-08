import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  // Scroll to top on route change within dashboard
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="animate-fade-in">
      {children}
    </div>
  );
}
