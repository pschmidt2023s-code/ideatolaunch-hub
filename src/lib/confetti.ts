import confetti from "canvas-confetti";

/**
 * Fire a celebration confetti burst.
 * Safe to call multiple times — uses localStorage to limit per-brand.
 */
export function fireStepConfetti(brandId: string, step: number) {
  const key = `confetti_step_${brandId}_${step}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"],
    zIndex: 9999,
  });
}

/**
 * Fire a big confetti burst for completing all 5 phases.
 */
export function fireCompletionConfetti(brandId: string) {
  const key = `confetti_fired_${brandId}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, "1");

  const duration = 2000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#10b981", "#3b82f6", "#f59e0b"],
      zIndex: 9999,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
