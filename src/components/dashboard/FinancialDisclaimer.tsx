import { AlertTriangle, Scale } from "lucide-react";

export function FinancialDisclaimer() {
  return (
    <div className="rounded-2xl border border-dashed border-warning/50 bg-warning/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-warning" />
        <h4 className="text-sm font-semibold text-warning">Rechtlicher Hinweis</h4>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
        <p>
          <strong>Keine Anlageberatung:</strong> Alle auf dieser Plattform dargestellten Informationen, Signale, Prognosen und Berechnungen dienen ausschließlich zu Bildungs- und Informationszwecken. Sie stellen keine Anlageberatung, Empfehlung oder Aufforderung zum Kauf oder Verkauf von Finanzinstrumenten dar.
        </p>
        <p>
          <strong>Keine Gewährleistung:</strong> Die dargestellten Berechnungen basieren auf historischen Daten und mathematischen Modellen. Vergangene Wertentwicklungen sind kein verlässlicher Indikator für zukünftige Ergebnisse. Alle Prognosen sind hypothetisch und können von der Realität erheblich abweichen.
        </p>
        <p>
          <strong>Eigenverantwortung:</strong> Investitions- und Handelsentscheidungen sollten stets auf Basis eigener Recherche und ggf. nach Rücksprache mit einem zugelassenen Finanzberater getroffen werden. Der Handel mit Finanzinstrumenten (insbes. CFDs, Kryptowährungen, Futures) birgt erhebliche Risiken bis hin zum Totalverlust.
        </p>
        <p>
          <strong>Regulatorisch:</strong> Diese Plattform ist kein zugelassener Finanzdienstleister gem. §32 KWG / MiFID II. Wir unterliegen nicht der Aufsicht der BaFin oder vergleichbarer Behörden. Die Nutzung erfolgt auf eigenes Risiko.
        </p>
      </div>
      <div className="flex items-center gap-2 pt-1 text-[10px] text-muted-foreground">
        <AlertTriangle className="h-3 w-3" />
        <span>Kapitalverlust möglich. Nur Geld investieren, dessen Verlust verkraftbar ist.</span>
      </div>
    </div>
  );
}
