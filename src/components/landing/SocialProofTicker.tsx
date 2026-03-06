import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const CITIES_DE = ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Wien", "Zürich", "Düsseldorf", "Leipzig"];
const CITIES_EN = ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Vienna", "Zurich", "Düsseldorf", "Leipzig"];

const ACTIONS_DE = [
  "hat Phase 1 abgeschlossen",
  "hat den Break-even berechnet",
  "hat Phase 3 gestartet",
  "hat den Risk Index geprüft",
  "hat einen Lieferanten gefunden",
  "hat die Compliance abgeschlossen",
  "hat den Launch Plan erstellt",
];

const ACTIONS_EN = [
  "completed Phase 1",
  "calculated break-even",
  "started Phase 3",
  "checked Risk Index",
  "found a supplier",
  "completed compliance",
  "created launch plan",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvent(isDE: boolean) {
  const city = randomFrom(isDE ? CITIES_DE : CITIES_EN);
  const action = randomFrom(isDE ? ACTIONS_DE : ACTIONS_EN);
  const minutesAgo = Math.floor(Math.random() * 45) + 1;
  const timeLabel = isDE ? `vor ${minutesAgo} Min.` : `${minutesAgo}m ago`;
  return { city, action, timeLabel, id: Date.now() + Math.random() };
}

export function SocialProofTicker() {
  const { i18n } = useTranslation();
  const isDE = i18n.language === "de";
  const [event, setEvent] = useState(() => generateEvent(isDE));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setEvent(generateEvent(isDE));
        setVisible(true);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, [isDE]);

  return (
    <div className="py-6 px-4">
      <div className="mx-auto max-w-md">
        <div
          className={`flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all duration-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
          <span>
            <span className="font-medium text-foreground/80">
              {isDE ? "Gründer aus " : "Founder from "}
              {event.city}
            </span>{" "}
            {event.action}{" "}
            <span className="text-muted-foreground/60">· {event.timeLabel}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
