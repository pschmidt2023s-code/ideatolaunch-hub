import { useState } from "react";
import { isBetaMode, saveBetaFeedback } from "@/lib/beta-client";
import { MessageSquarePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "ux", label: "UX Feedback" },
  { value: "other", label: "Sonstiges" },
] as const;

export function BetaFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>("ux");
  const [message, setMessage] = useState("");

  if (!isBetaMode()) return null;

  const handleSubmit = () => {
    if (!message.trim()) return;
    saveBetaFeedback({
      category: category as "bug" | "feature" | "ux" | "other",
      message: message.trim(),
      route: window.location.hash.replace("#", "") || "/",
    });
    setMessage("");
    setOpen(false);
    toast.success("Feedback gespeichert – danke!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-105 active:scale-95">
          <MessageSquarePlus className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Beta Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Was ist dir aufgefallen?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            Screenshot (coming soon)
          </div>
          <Button onClick={handleSubmit} disabled={!message.trim()} className="w-full gap-2">
            <Send className="h-4 w-4" />
            Feedback senden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
