import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Global keyboard shortcuts for power users.
 * ⌘K / Ctrl+K → Focus command palette
 * ⌘S / Ctrl+S → Prevent browser save
 * ⌘1-5 → Navigate to workflow steps
 * ⌘D → Dashboard home
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      switch (e.key) {
        case "k":
        case "K":
          e.preventDefault();
          // Focus command palette input
          const input = document.querySelector<HTMLInputElement>('[data-command-input]');
          input?.focus();
          break;
        case "s":
        case "S":
          e.preventDefault();
          break;
        case "d":
        case "D":
          if (!e.shiftKey) {
            e.preventDefault();
            navigate("/dashboard");
          }
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
          e.preventDefault();
          navigate(`/dashboard/step/${e.key}`);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
}
