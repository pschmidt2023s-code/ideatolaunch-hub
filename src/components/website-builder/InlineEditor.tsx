import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save } from "lucide-react";
import type { WebsiteData } from "./types";

interface InlineEditorProps {
  fieldPath: string;
  currentValue: string;
  onSave: (path: string, value: string) => void;
  onClose: () => void;
}

export function InlineEditor({ fieldPath, currentValue, onSave, onClose }: InlineEditorProps) {
  const [value, setValue] = useState(currentValue);
  const isLong = currentValue.length > 100;

  const pathLabel = fieldPath
    .replace("pages.", "")
    .replace(/\./g, " › ")
    .replace(/(\d+)/g, "#$1");

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardHeader className="pb-2 flex-row items-center justify-between">
        <CardTitle className="text-xs font-mono text-accent">{pathLabel}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLong ? (
          <Textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            className="text-sm min-h-[80px]"
            autoFocus
          />
        ) : (
          <Input
            value={value}
            onChange={e => setValue(e.target.value)}
            className="text-sm"
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") onSave(fieldPath, value); }}
          />
        )}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Abbrechen
          </Button>
          <Button size="sm" onClick={() => onSave(fieldPath, value)} className="text-xs gap-1.5">
            <Save className="h-3 w-3" /> Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility to set a nested value by dot-path
export function setNestedValue(obj: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = path.split(".");
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i]);
    current = current[key];
  }
  const lastKey = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1]);
  current[lastKey] = value;
  return clone;
}
