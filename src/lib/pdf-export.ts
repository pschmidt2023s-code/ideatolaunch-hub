import jsPDF from "jspdf";

interface BrandReportData {
  brandName: string;
  positioning?: string;
  values?: string;
  marketAngle?: string;
  differentiation?: string;
  production?: { cost: number; packaging: number; shipping: number; marketing: number };
  recommendedPrice?: number;
  margin?: number;
  breakEven?: number;
  complianceChecklist?: { item: string; checked: boolean }[];
  salesChannel?: string;
  fulfillment?: string;
  launchQuantity?: number;
}

export function generateBrandReport(data: BrandReportData): void {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  const addTitle = (text: string) => {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, y);
    y += 10;
  };

  const addSection = (title: string) => {
    if (y > 260) { doc.addPage(); y = margin; }
    y += 6;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, y);
    y += 7;
  };

  const addText = (text: string) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  };

  const addKeyValue = (key: string, value: string) => {
    if (y > 270) { doc.addPage(); y = margin; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${key}: `, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + doc.getTextWidth(`${key}: `), y);
    y += 6;
  };

  // Header
  addTitle(`Brand Report — ${data.brandName}`);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, margin, y);
  y += 10;
  doc.line(margin, y, 190, y);
  y += 6;

  // Positioning
  if (data.positioning) {
    addSection("Positionierung");
    addText(data.positioning);
  }
  if (data.values) {
    addSection("Markenwerte");
    addText(data.values);
  }
  if (data.marketAngle) {
    addSection("Marktwinkel");
    addText(data.marketAngle);
  }
  if (data.differentiation) {
    addSection("Differenzierung");
    addText(data.differentiation);
  }

  // Financials
  if (data.production) {
    addSection("Finanzen");
    addKeyValue("Produktionskosten", `${data.production.cost} €`);
    addKeyValue("Verpackung", `${data.production.packaging} €`);
    addKeyValue("Versand", `${data.production.shipping} €`);
    addKeyValue("Marketing", `${data.production.marketing} €`);
    if (data.recommendedPrice) addKeyValue("Empf. Preis", `${data.recommendedPrice.toFixed(2)} €`);
    if (data.margin) addKeyValue("Marge", `${data.margin.toFixed(1)}%`);
    if (data.breakEven) addKeyValue("Break-even", `${data.breakEven} Stück`);
  }

  // Compliance
  if (data.complianceChecklist?.length) {
    addSection("Compliance-Checkliste");
    data.complianceChecklist.forEach(({ item, checked }) => {
      addText(`${checked ? "✓" : "○"} ${item}`);
    });
  }

  // Sales
  if (data.salesChannel) {
    addSection("Vertrieb");
    addKeyValue("Kanal", data.salesChannel);
    if (data.fulfillment) addKeyValue("Fulfillment", data.fulfillment);
    if (data.launchQuantity) addKeyValue("Launch-Menge", `${data.launchQuantity}`);
  }

  doc.save(`${data.brandName.replace(/\s+/g, "_")}_Report.pdf`);
}
