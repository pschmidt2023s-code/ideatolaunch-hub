import { Award } from "lucide-react";

interface AuthorBoxProps {
  updatedDate?: string;
}

export function AuthorBox({ updatedDate }: AuthorBoxProps) {
  return (
    <div className="rounded-xl border bg-card p-6 flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <Award className="h-5 w-5 text-accent" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-sm">Patric-Maurice Schmidt</h4>
          <span className="text-xs text-muted-foreground">· Gründer, BuildYourBrand</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          E-Commerce-Gründer mit Erfahrung im Aufbau von Eigenmarken im DACH-Markt. 
          Spezialisiert auf datenbasierte Risikoanalyse und strukturierten Markenaufbau.
        </p>
        {updatedDate && (
          <p className="text-xs text-muted-foreground">
            Zuletzt aktualisiert: <time dateTime={updatedDate}>{new Date(updatedDate).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}</time>
          </p>
        )}
      </div>
    </div>
  );
}
