import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

const weeks = [
  {
    week: "Woche 1",
    title: "Vorbereitung",
    tasks: [
      "Social-Media-Profile erstellen",
      "Content-Kalender planen",
      "Teaser-Content produzieren",
      "E-Mail-Liste aufbauen",
      "Influencer recherchieren",
    ],
  },
  {
    week: "Woche 2",
    title: "Pre-Launch",
    tasks: [
      "Landing Page live schalten",
      "Erste Teaser posten",
      "Warteliste bewerben",
      "Pressemitteilung vorbereiten",
      "Produktfotos finalisieren",
    ],
  },
  {
    week: "Woche 3",
    title: "Launch",
    tasks: [
      "Shop live schalten",
      "Launch-Announcement posten",
      "E-Mail an Warteliste senden",
      "Erste Ads schalten",
      "PR-Outreach starten",
    ],
  },
  {
    week: "Woche 4",
    title: "Post-Launch",
    tasks: [
      "Kundenfeedback sammeln",
      "Ads optimieren",
      "Retargeting einrichten",
      "Review-Kampagne starten",
      "Erste Analyse & Learnings",
    ],
  },
];

export function StepLaunchRoadmap() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allTasks = weeks.flatMap((w) => w.tasks);
  const completedCount = allTasks.filter((t) => checked[t]).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            30-Tage Launch-Plan — {completedCount}/{allTasks.length} Aufgaben erledigt
          </p>
        </div>
        <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {Math.round((completedCount / allTasks.length) * 100)}%
        </div>
      </div>

      {weeks.map(({ week, title, tasks }) => (
        <div key={week} className="rounded-xl border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-mono font-medium text-primary-foreground">
              {week}
            </span>
            <h3 className="font-semibold">{title}</h3>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => (
              <label key={task} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={!!checked[task]}
                  onCheckedChange={(v) => setChecked((p) => ({ ...p, [task]: !!v }))}
                />
                <span className={`text-sm ${checked[task] ? "line-through text-muted-foreground" : ""}`}>
                  {task}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
