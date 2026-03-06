import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SuccessFeedbackProps {
  message: string;
  show: boolean;
  onDone?: () => void;
  duration?: number;
}

/**
 * Inline success feedback that auto-dismisses.
 * Use after save/complete actions for immediate visual confirmation.
 */
export function SuccessFeedback({ message, show, onDone, duration = 2500 }: SuccessFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onDone]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-2 text-sm font-medium text-success",
        "animate-scale-in"
      )}
    >
      <CheckCircle2 className="h-4 w-4" />
      {message}
    </div>
  );
}
