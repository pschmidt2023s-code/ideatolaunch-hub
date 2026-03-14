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

/**
 * Fire a subtle celebration for smaller milestones (first brand, first export, etc.)
 */
export function fireMilestoneConfetti() {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: { y: 0.7, x: 0.5 },
    colors: ["#10b981", "#3b82f6"],
    scalar: 0.8,
    gravity: 1.2,
    zIndex: 9999,
  });
}

/**
 * Fire emoji-style confetti (stars)
 */
export function fireStarConfetti() {
  const defaults = { spread: 360, ticks: 60, gravity: 0, decay: 0.94, startVelocity: 20, zIndex: 9999 };
  confetti({ ...defaults, particleCount: 30, shapes: ["star"], scalar: 1.2, colors: ["#f59e0b", "#fbbf24"] });
  setTimeout(() => {
    confetti({ ...defaults, particleCount: 15, shapes: ["circle"], scalar: 0.8, colors: ["#10b981", "#34d399"] });
  }, 150);
}

/**
 * Level-up celebration
 */
export function fireLevelUpConfetti() {
  const end = Date.now() + 1000;
  const frame = () => {
    confetti({
      particleCount: 2,
      angle: Math.random() * 360,
      spread: 60,
      origin: { x: Math.random(), y: Math.random() * 0.3 },
      colors: ["#8b5cf6", "#6366f1", "#ec4899", "#f59e0b"],
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
