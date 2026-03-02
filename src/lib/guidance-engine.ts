// ─── Contextual Knowledge System ─────────────────────────────────
// Deterministic, structured guidance for each workflow step.
// NO AI calls. Pure business knowledge.

export interface StepGuidance {
  what_is_this: string;
  why_it_matters: string;
  common_mistakes: string[];
  how_to_decide: string;
  confidence_tip: string;
}

export interface TermDefinition {
  term: string;
  short: string;
  detail: string;
  example?: string;
}

// ─── Step Guidance ──────────────────────────────────────────────

const stepGuidanceDE: Record<number, StepGuidance> = {
  1: {
    what_is_this: "Hier definierst du Produkt, Zielgruppe, Positionierung UND deine Markenidentität — Name, Tonalität und visuelle Richtung.",
    why_it_matters: "Positionierung und Markenidentität gehören zusammen. Sie bestimmen, wie Kunden dich wahrnehmen, was du verlangen kannst und wie du kommunizierst.",
    common_mistakes: [
      "Zu breite Zielgruppe definieren ('alle Frauen 18-65')",
      "Differenzierung vergessen — warum sollte jemand DEIN Produkt kaufen?",
      "Markennamen nach persönlichem Geschmack statt nach Marktpositionierung wählen",
    ],
    how_to_decide: "Frage dich: Für wen löse ich welches Problem besser als alle anderen? Der Markenname muss leicht merkbar und als Domain verfügbar sein.",
    confidence_tip: "Perfekt muss es nicht sein. Eine klare, testbare Hypothese ist besser als wochenlange Analyse.",
  },
  2: {
    what_is_this: "Der Business-Kalkulator berechnet Stückkosten, empfiehlt einen Verkaufspreis und zeigt deinen Break-even.",
    why_it_matters: "Ohne realistische Kalkulation riskierst du, Geld zu verlieren. Die Marge entscheidet, ob du Marketing finanzieren kannst.",
    common_mistakes: [
      "Versandkosten vergessen oder unterschätzen",
      "Marketing-Budget zu niedrig ansetzen",
      "Marge unter 30% akzeptieren — das lässt keinen Raum für Wachstum",
    ],
    how_to_decide: "Dein Preis muss mindestens das 2,5-fache deiner Stückkosten betragen. Im Premium-Segment eher das 4-fache.",
    confidence_tip: "Starte mit konservativen Zahlen. Es ist besser, positiv überrascht zu werden als negativ.",
  },
  3: {
    what_is_this: "Hier planst du die Produktion: Region, MOQ, Kategorie, Qualitätsstandards und Lieferantenauswahl.",
    why_it_matters: "Produktionsfehler sind teuer und zeitraubend. Eine gute Vorbereitung schützt dein Kapital und deinen Zeitplan.",
    common_mistakes: [
      "Ohne Musterproduktion direkt in die volle Produktion gehen",
      "MOQ des Lieferanten unterschätzen — das bindet Kapital",
      "Qualitätskontrollen erst nach Lieferung statt während der Produktion planen",
    ],
    how_to_decide: "Wenn dein Budget unter 10.000 € liegt, starte mit EU-Lieferanten und kleinen MOQs. Asien lohnt sich erst ab größeren Mengen.",
    confidence_tip: "Bestelle immer erst ein Muster. Kein seriöser Lieferant wird das ablehnen.",
  },
  4: {
    what_is_this: "Compliance (Label, Recht, Barcode) UND Vertriebsvorbereitung (Kanal, Fulfillment, operative Checkliste) in einer Phase.",
    why_it_matters: "Fehlende Compliance kann zu Abmahnungen führen. Der falsche Vertriebskanal verschwendet Budget. Beides muss vor dem Launch stehen.",
    common_mistakes: [
      "Pflichtangaben wie Herstelleradresse oder Chargennummer vergessen",
      "Auf zu vielen Kanälen gleichzeitig starten",
      "Fulfillment-Kosten nicht in die Kalkulation einbeziehen",
    ],
    how_to_decide: "Gehe die Compliance-Checkliste Punkt für Punkt durch. Starte mit einem einzigen Vertriebskanal, den du zu 100% beherrscht.",
    confidence_tip: "500 verkaufte Einheiten auf einem Kanal sind wertvoller als 50 auf zehn Kanälen.",
  },
  5: {
    what_is_this: "Der Launch-Plan strukturiert deine Aktivitäten von der Vorbereitung bis zum Post-Launch.",
    why_it_matters: "Ein Launch ohne Plan ist Glücksspiel. Strukturierte Aktivitäten maximieren die Wirkung deiner begrenzten Ressourcen.",
    common_mistakes: [
      "Alles auf den Launch-Tag setzen statt Momentum vorher aufzubauen",
      "Kein Pre-Launch-Marketing (Warteliste, Teaser, Community)",
      "Nach dem Launch aufhören statt die ersten Learnings sofort umzusetzen",
    ],
    how_to_decide: "Plane rückwärts vom Launch-Tag. Was muss 2 Wochen vorher stehen? Priorisiere gnadenlos.",
    confidence_tip: "Ein imperfekter Launch schlägt keinen Launch. Du kannst alles iterieren — außer verpasste Zeit.",
  },
};

const stepGuidanceEN: Record<number, StepGuidance> = {
  1: {
    what_is_this: "Define your product, audience, positioning AND brand identity — name, tone, and visual direction.",
    why_it_matters: "Positioning and brand identity belong together. They determine how customers perceive you, what you can charge, and how you communicate.",
    common_mistakes: [
      "Defining too broad an audience ('all women 18-65')",
      "Forgetting differentiation — why should someone buy YOUR product?",
      "Choosing a brand name by personal taste instead of market positioning",
    ],
    how_to_decide: "Ask yourself: For whom do I solve which problem better than everyone else? The name must be memorable and available as a domain.",
    confidence_tip: "It doesn't need to be perfect. A clear, testable hypothesis beats weeks of analysis.",
  },
  2: {
    what_is_this: "The calculator computes unit costs, recommends a selling price, and shows your break-even.",
    why_it_matters: "Without realistic calculations, you risk losing money. Margin determines whether you can fund marketing.",
    common_mistakes: [
      "Forgetting or underestimating shipping costs",
      "Setting marketing budget too low",
      "Accepting margin below 30% — leaves no room for growth",
    ],
    how_to_decide: "Your price should be at least 2.5x your unit cost. In premium segments, aim for 4x.",
    confidence_tip: "Start with conservative numbers. Better to be positively surprised than negatively.",
  },
  3: {
    what_is_this: "Plan production: region, MOQ, category, quality standards, and supplier selection.",
    why_it_matters: "Production mistakes are expensive and time-consuming. Good preparation protects your capital and timeline.",
    common_mistakes: [
      "Going straight to full production without samples",
      "Underestimating supplier MOQ — it locks up capital",
      "Planning quality controls after delivery instead of during production",
    ],
    how_to_decide: "If your budget is under €10,000, start with EU suppliers and small MOQs. Asia makes sense only at larger volumes.",
    confidence_tip: "Always order a sample first. No serious supplier will refuse.",
  },
  4: {
    what_is_this: "Compliance (labels, legal, barcode) AND sales setup (channel, fulfillment, operational checklist) in one phase.",
    why_it_matters: "Missing compliance can lead to legal action. The wrong sales channel wastes budget. Both must be ready before launch.",
    common_mistakes: [
      "Forgetting mandatory info like manufacturer address or batch number",
      "Launching on too many channels at once",
      "Not including fulfillment costs in calculations",
    ],
    how_to_decide: "Go through the compliance checklist item by item. Start with a single channel you fully control.",
    confidence_tip: "500 units sold on one channel are more valuable than 50 units across ten channels.",
  },
  5: {
    what_is_this: "The launch plan structures activities from preparation to post-launch.",
    why_it_matters: "A launch without a plan is gambling. Structured activities maximize impact of limited resources.",
    common_mistakes: [
      "Putting everything on launch day instead of building momentum before",
      "No pre-launch marketing (waitlist, teasers, community)",
      "Stopping after launch instead of immediately implementing first learnings",
    ],
    how_to_decide: "Plan backwards from launch day. What needs to be ready 2 weeks before? Prioritize ruthlessly.",
    confidence_tip: "An imperfect launch beats no launch. You can iterate everything — except missed time.",
  },
};

// ─── Term Glossary ──────────────────────────────────────────────

const termGlossaryDE: Record<string, TermDefinition> = {
  MOQ: {
    term: "MOQ (Minimum Order Quantity)",
    short: "Die Mindestbestellmenge, die ein Lieferant für einen Auftrag verlangt.",
    detail: "Die MOQ bestimmt, wie viel Kapital du vorab in Ware binden musst. Hohe MOQs senken den Stückpreis, binden aber mehr Kapital. Für Erstgründer empfehlen sich Lieferanten mit niedrigen MOQs (50–500 Stück).",
    example: "Ein Lieferant mit MOQ 1.000 bei 3 € Stückpreis bindet 3.000 € allein für die erste Bestellung.",
  },
  Margin: {
    term: "Marge (Gross Margin)",
    short: "Der prozentuale Anteil des Verkaufspreises, der nach Abzug der Stückkosten übrig bleibt.",
    detail: "Die Marge finanziert dein Marketing, deine Fixkosten und deinen Gewinn. Unter 30% wird bezahltes Marketing schwierig, unter 20% ist das Geschäftsmodell kaum tragfähig. Premium-Marken zielen auf 60%+ Marge.",
    example: "Stückkosten 5 €, Verkaufspreis 20 € → Marge = 75%",
  },
  "Break-even": {
    term: "Break-even-Punkt",
    short: "Die Anzahl verkaufter Einheiten, ab der du deine Fixkosten gedeckt hast und Gewinn machst.",
    detail: "Der Break-even zeigt dir, wie viele Einheiten du verkaufen musst, bevor dein Unternehmen profitabel wird. Je niedriger, desto schneller erreichst du die Gewinnzone.",
    example: "Bei 10 € Gewinn pro Stück und 2.000 € Fixkosten: Break-even = 200 Stück",
  },
  Fulfillment: {
    term: "Fulfillment",
    short: "Der gesamte Prozess von Bestelleingang bis Lieferung an den Kunden.",
    detail: "Fulfillment umfasst Lagerhaltung, Kommissionierung, Verpackung und Versand. Du kannst das selbst machen (günstiger, aber zeitintensiv) oder an einen 3PL-Dienstleister auslagern (teurer, aber skalierbar).",
  },
  "3PL": {
    term: "3PL (Third-Party Logistics)",
    short: "Ein externer Dienstleister, der Lager und Versand für dich übernimmt.",
    detail: "3PL-Anbieter lagern deine Ware, verpacken Bestellungen und versenden sie. Das kostet typisch 2–5 € pro Bestellung plus Lagergebühren, spart dir aber Platz und Zeit.",
  },
  "Price Level": {
    term: "Preissegment",
    short: "Die Preis-Kategorie, in der du dein Produkt positionierst.",
    detail: "Budget (günstiger als Markt), Mittelklasse (Marktdurchschnitt), Premium (über Marktschnitt mit Mehrwert), Luxus (Exklusivität und Status). Das Segment bestimmt deine gesamte Markenstrategie.",
  },
  Positioning: {
    term: "Positionierung",
    short: "Wie sich deine Marke im Vergleich zu Wettbewerbern im Kopf der Zielgruppe verortet.",
    detail: "Gute Positionierung beantwortet: Für wen? Was? Warum anders? Sie bestimmt Preis, Kommunikation und Vertrieb. Ohne Positionierung bist du austauschbar.",
  },
  Differentiation: {
    term: "Differenzierung",
    short: "Was dein Produkt einzigartig und von Alternativen unterscheidbar macht.",
    detail: "Differenzierung kann über Produkt (Qualität, Innovation), Marke (Story, Design), Preis (Budget oder Premium), Vertrieb (exklusiv) oder Service (Kundenerlebnis) erfolgen.",
  },
  Compliance: {
    term: "Compliance",
    short: "Einhaltung aller gesetzlichen Vorschriften für dein Produkt und deine Verpackung.",
    detail: "Je nach Produktkategorie gelten unterschiedliche Vorschriften (EU-Kosmetikverordnung, Lebensmittelrecht, Produktsicherheit). Verstöße können Abmahnungen, Verkaufsverbote oder Bußgelder nach sich ziehen.",
  },
  EAN: {
    term: "EAN / GTIN (Barcode)",
    short: "Ein standardisierter Barcode zur eindeutigen Identifikation deines Produkts im Handel.",
    detail: "Ohne EAN/GTIN kannst du in den meisten Einzelhandelskanälen und auf Marktplätzen wie Amazon nicht gelistet werden. Du bekommst sie über GS1.",
  },
};

const termGlossaryEN: Record<string, TermDefinition> = {
  MOQ: {
    term: "MOQ (Minimum Order Quantity)",
    short: "The minimum number of units a supplier requires per order.",
    detail: "MOQ determines how much capital you need to commit upfront. High MOQs lower unit price but lock more capital. For first-time founders, look for suppliers with low MOQs (50–500 units).",
    example: "A supplier with MOQ 1,000 at €3/unit locks up €3,000 for just the first order.",
  },
  Margin: {
    term: "Margin (Gross Margin)",
    short: "The percentage of the selling price remaining after deducting unit costs.",
    detail: "Margin funds your marketing, fixed costs, and profit. Below 30%, paid marketing becomes difficult. Below 20%, the business model is barely viable. Premium brands aim for 60%+ margin.",
    example: "Unit cost €5, selling price €20 → Margin = 75%",
  },
  "Break-even": {
    term: "Break-even Point",
    short: "The number of units sold at which you've covered your fixed costs and start making profit.",
    detail: "Break-even shows how many units you need to sell before becoming profitable. The lower, the faster you reach profitability.",
    example: "At €10 profit per unit and €2,000 fixed costs: Break-even = 200 units",
  },
  Fulfillment: {
    term: "Fulfillment",
    short: "The entire process from order receipt to customer delivery.",
    detail: "Fulfillment includes warehousing, picking, packing, and shipping. You can do it yourself (cheaper but time-intensive) or outsource to a 3PL (more expensive but scalable).",
  },
  "3PL": {
    term: "3PL (Third-Party Logistics)",
    short: "An external provider that handles warehousing and shipping for you.",
    detail: "3PL providers store your goods, pack orders, and ship them. Typically costs €2–5 per order plus storage fees, but saves space and time.",
  },
  "Price Level": {
    term: "Price Segment",
    short: "The price category in which you position your product.",
    detail: "Budget (below market), Mid-range (market average), Premium (above average with value-add), Luxury (exclusivity and status). The segment determines your entire brand strategy.",
  },
  Positioning: {
    term: "Positioning",
    short: "How your brand situates itself relative to competitors in the minds of your target audience.",
    detail: "Good positioning answers: For whom? What? Why different? It determines price, communication, and distribution. Without positioning, you're interchangeable.",
  },
  Differentiation: {
    term: "Differentiation",
    short: "What makes your product unique and distinguishable from alternatives.",
    detail: "Differentiation can be through product (quality, innovation), brand (story, design), price (budget or premium), distribution (exclusive), or service (customer experience).",
  },
  Compliance: {
    term: "Compliance",
    short: "Adherence to all legal regulations for your product and packaging.",
    detail: "Different regulations apply depending on product category (EU cosmetics regulation, food law, product safety). Violations can lead to legal action, sales bans, or fines.",
  },
  EAN: {
    term: "EAN / GTIN (Barcode)",
    short: "A standardized barcode for uniquely identifying your product in retail.",
    detail: "Without an EAN/GTIN, you can't be listed in most retail channels or marketplaces like Amazon. You get them through GS1.",
  },
};

// ─── Public API ─────────────────────────────────────────────────

export function getStepGuidance(stepNumber: number, lang: string = "de"): StepGuidance | null {
  const map = lang === "en" ? stepGuidanceEN : stepGuidanceDE;
  return map[stepNumber] ?? null;
}

export function getTermDefinition(term: string, lang: string = "de"): TermDefinition | null {
  const map = lang === "en" ? termGlossaryEN : termGlossaryDE;
  return map[term] ?? null;
}

export function getAllTerms(lang: string = "de"): string[] {
  const map = lang === "en" ? termGlossaryEN : termGlossaryDE;
  return Object.keys(map);
}
