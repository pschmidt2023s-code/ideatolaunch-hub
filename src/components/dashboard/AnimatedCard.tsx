import { ReactNode, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay index (multiplied by 80ms) */
  index?: number;
  /** Animation variant */
  variant?: "fade-up" | "scale" | "slide-left";
}

/**
 * Intersection-observer powered reveal animation for cards.
 * Uses CSS animations for zero-JS-runtime cost after mount.
 */
export function AnimatedCard({
  children,
  className,
  index = 0,
  variant = "fade-up",
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animClass = {
    "fade-up": "animate-fade-in",
    scale: "animate-scale-in",
    "slide-left": "animate-slide-in-left",
  }[variant];

  return (
    <div
      ref={ref}
      className={cn(
        "transition-opacity",
        visible ? animClass : "opacity-0",
        className
      )}
      style={{
        animationDelay: visible ? `${index * 80}ms` : undefined,
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
