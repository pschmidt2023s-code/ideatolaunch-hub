import { useEffect, useRef, useState } from "react";

/**
 * Intersection Observer hook for scroll-reveal animations.
 * Returns a ref to attach + a boolean `isVisible`.
 * Once visible, stays visible (no re-hide).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px"
) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}
