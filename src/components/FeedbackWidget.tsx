import { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug" },
  { value: "feature", label: "💡 Feature" },
  { value: "ux", label: "🎨 UX" },
  { value: "general", label: "💬 Allgemein" },
] as const;

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";

  useEffect(() => {
    if (open && textareaRef.current) textareaRef.current.focus();
  }, [open]);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const page = window.location.hash.replace("#", "") || "/";
      const { error } = await supabase.from("user_feedback" as any).insert({
        user_id: user.id,
        category,
        message: message.trim(),
        page,
      } as any);
      if (error) throw error;
      setMessage("");
      setOpen(false);
      toast.success(isDE ? "Feedback gesendet – danke!" : "Feedback sent – thank you!");
    } catch (err: any) {
      toast.error(err.message || "Fehler beim Senden");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Feedback geben"
        >
          <MessageSquarePlus className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[360px] flex-col rounded-2xl border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold">{isDE ? "Feedback" : "Feedback"}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    category === c.value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Message */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isDE ? "Was ist dir aufgefallen? Was können wir verbessern?" : "What did you notice? What can we improve?"}
              rows={4}
              className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            />

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || sending}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              {isDE ? "Feedback senden" : "Send Feedback"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
