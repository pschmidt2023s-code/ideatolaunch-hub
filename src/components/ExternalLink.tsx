import { openExternal } from "@/lib/openExternal";
import { cn } from "@/lib/utils";
import type { ReactNode, KeyboardEvent, MouseEvent } from "react";

interface ExternalLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  /** Make the component render as a span instead of anchor (for card wrappers) */
  asSpan?: boolean;
}

/**
 * Reusable external link component.
 * Uses openExternal() so links open in the system browser on Tauri.
 * Keyboard accessible: Enter triggers the link.
 */
export function ExternalLink({
  href,
  className,
  children,
  onClick,
  asSpan = false,
}: ExternalLinkProps) {
  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
    openExternal(href);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
      openExternal(href);
    }
  };

  const props = {
    role: "link" as const,
    tabIndex: 0,
    className: cn("cursor-pointer", className),
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    "aria-label": `Open ${href} in browser`,
  };

  if (asSpan) {
    return <span {...props}>{children}</span>;
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
