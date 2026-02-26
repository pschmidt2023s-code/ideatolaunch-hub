// ─── Email template builders (DE + EN) ───────────────────────────────
import { wrapLayout, APP_URL, SUPPORT_EMAIL, type Locale } from "./email-layout.ts";

const PLAN_LABELS: Record<string, string> = { free: "Free", builder: "Builder", pro: "Pro" };
const PLAN_PRICES: Record<string, Record<Locale, string>> = {
  builder: { de: "29 €/Monat", en: "€29/month" },
  pro: { de: "79 €/Monat", en: "€79/month" },
};

const UPGRADE_FEATURES: Record<string, Record<Locale, string[]>> = {
  builder: {
    de: ["Insights freigeschaltet", "PDF Export", "Budget-Planer"],
    en: ["Insights unlocked", "PDF Export", "Budget Planner"],
  },
  pro: {
    de: ["Szenario-Simulator", "Supplier Matching", "Guided Founder Mode"],
    en: ["Scenario Simulator", "Supplier Matching", "Guided Founder Mode"],
  },
};

interface EmailOutput {
  subject: string;
  html: string;
  text: string;
}

// ─── 1. Payment Success ─────────────────────────────────────────────

interface PaymentSuccessParams {
  plan: string;
  locale?: Locale;
  firstName?: string;
  nextBillingDate?: string;
  portalUrl?: string;
}

export function paymentSuccessEmail(params: PaymentSuccessParams): EmailOutput {
  const { plan, locale = "de", firstName, nextBillingDate, portalUrl } = params;
  const label = PLAN_LABELS[plan] || plan;
  const price = PLAN_PRICES[plan]?.[locale] || "";
  const de = locale === "de";

  const greeting = firstName ? (de ? `Hallo ${firstName},` : `Hi ${firstName},`) : (de ? "Hallo!" : "Hi!");
  const billingLine = nextBillingDate
    ? `<li><strong>${de ? "Nächste Abrechnung" : "Next billing date"}:</strong> ${nextBillingDate}</li>`
    : "";
  const billingText = nextBillingDate ? `\n${de ? "Nächste Abrechnung" : "Next billing date"}: ${nextBillingDate}` : "";

  const ctaLabel = de ? "Zum Dashboard" : "Go to Dashboard";
  const manageLabel = de ? "Abo verwalten (Stripe Kundenportal)" : "Manage subscription (Stripe customer portal)";
  const cancelNote = de
    ? "Du kannst jederzeit kündigen. Du behältst Zugriff bis zum Ende des Abrechnungszeitraums."
    : "You can cancel anytime. You'll keep access until the end of your billing period.";

  const subject = de ? `Dein ${label} Plan ist aktiv` : `Your ${label} plan is now active`;

  const bodyHtml = `
    <p>${greeting}</p>
    <h1>${de ? `Dein ${label} Plan ist jetzt aktiv` : `Your ${label} plan is now active`}</h1>
    <ul>
      <li><strong>Plan:</strong> ${label}</li>
      <li><strong>${de ? "Preis" : "Price"}:</strong> ${price}</li>
      <li><strong>${de ? "Abrechnung" : "Billing"}:</strong> ${de ? "Monatlich, automatische Verlängerung" : "Monthly, auto-renewing"}</li>
      ${billingLine}
    </ul>
    <a href="${APP_URL}/dashboard" class="cta">${ctaLabel}</a>
    ${portalUrl ? `<br><a href="${portalUrl}" class="secondary-link">${manageLabel}</a>` : `<!--TODO: add Stripe portal URL-->`}
    <p class="note">${cancelNote}</p>
  `;

  const text = [
    greeting,
    "",
    de ? `Dein ${label} Plan ist jetzt aktiv.` : `Your ${label} plan is now active.`,
    "",
    `Plan: ${label}`,
    `${de ? "Preis" : "Price"}: ${price}`,
    `${de ? "Abrechnung" : "Billing"}: ${de ? "Monatlich" : "Monthly"}`,
    billingText,
    "",
    `${ctaLabel}: ${APP_URL}/dashboard`,
    portalUrl ? `${manageLabel}: ${portalUrl}` : "",
    "",
    cancelNote,
    "",
    `Support: ${SUPPORT_EMAIL}`,
  ].filter(Boolean).join("\n");

  return { subject, html: wrapLayout(bodyHtml, locale), text };
}

// ─── 2. Upgrade Confirmation ────────────────────────────────────────

interface UpgradeParams {
  oldPlan: string;
  newPlan: string;
  locale?: Locale;
  firstName?: string;
}

export function upgradeEmail(params: UpgradeParams): EmailOutput {
  const { oldPlan, newPlan, locale = "de", firstName } = params;
  const oldLabel = PLAN_LABELS[oldPlan] || oldPlan;
  const newLabel = PLAN_LABELS[newPlan] || newPlan;
  const de = locale === "de";

  const greeting = firstName ? (de ? `Hallo ${firstName},` : `Hi ${firstName},`) : (de ? "Hallo!" : "Hi!");
  const features = UPGRADE_FEATURES[newPlan]?.[locale] || [];
  const featuresHtml = features.map((f) => `<li>${f}</li>`).join("\n      ");
  const featuresText = features.map((f) => `  - ${f}`).join("\n");

  const subject = de ? `Upgrade bestätigt: ${oldLabel} → ${newLabel}` : `Upgrade confirmed: ${oldLabel} → ${newLabel}`;
  const ctaLabel = de ? "Neue Features ansehen" : "Explore what's new";

  const bodyHtml = `
    <p>${greeting}</p>
    <h1>${subject}</h1>
    ${features.length > 0 ? `<p>${de ? "Jetzt freigeschaltet" : "Now unlocked"}:</p><ul>${featuresHtml}</ul>` : ""}
    <a href="${APP_URL}/dashboard" class="cta">${ctaLabel}</a>
  `;

  const text = [
    greeting,
    "",
    subject,
    "",
    features.length > 0 ? `${de ? "Jetzt freigeschaltet" : "Now unlocked"}:` : "",
    featuresText,
    "",
    `${ctaLabel}: ${APP_URL}/dashboard`,
    "",
    `Support: ${SUPPORT_EMAIL}`,
  ].filter(Boolean).join("\n");

  return { subject, html: wrapLayout(bodyHtml, locale), text };
}

// ─── 3. Cancellation Confirmation ───────────────────────────────────

interface CancellationParams {
  plan: string;
  accessUntil?: string;
  locale?: Locale;
  firstName?: string;
}

export function cancellationEmail(params: CancellationParams): EmailOutput {
  const { plan, accessUntil, locale = "de", firstName } = params;
  const label = PLAN_LABELS[plan] || plan;
  const de = locale === "de";

  const greeting = firstName ? (de ? `Hallo ${firstName},` : `Hi ${firstName},`) : (de ? "Hallo!" : "Hi!");
  const subject = de ? "Dein Abo wurde gekündigt" : "Your subscription has been cancelled";
  const ctaLabel = de ? "Plan reaktivieren" : "Reactivate plan";
  const reactivateNote = de ? "Du kannst jederzeit wieder upgraden." : "You can upgrade again anytime.";

  const accessLine = accessUntil
    ? `<li><strong>${de ? "Zugang bis" : "Access until"}:</strong> ${accessUntil}</li>`
    : "";
  const accessText = accessUntil ? `${de ? "Zugang bis" : "Access until"}: ${accessUntil}` : "";

  const bodyHtml = `
    <p>${greeting}</p>
    <h1>${subject}</h1>
    <ul>
      <li><strong>Plan:</strong> ${label}</li>
      ${accessLine}
    </ul>
    <p>${reactivateNote}</p>
    <a href="${APP_URL}/pricing" class="cta">${ctaLabel}</a>
  `;

  const text = [
    greeting,
    "",
    subject,
    "",
    `Plan: ${label}`,
    accessText,
    "",
    reactivateNote,
    "",
    `${ctaLabel}: ${APP_URL}/pricing`,
    "",
    `Support: ${SUPPORT_EMAIL}`,
  ].filter(Boolean).join("\n");

  return { subject, html: wrapLayout(bodyHtml, locale), text };
}

// ─── 4. Blueprint – 7-Step Workflow Overview ────────────────────────

interface BlueprintParams {
  locale?: Locale;
  firstName?: string;
}

const STEPS_DE = [
  { num: 1, title: "Idea Foundation", desc: "Produktidee validieren, Zielgruppe definieren, Marktchance bewerten" },
  { num: 2, title: "Brand Structure", desc: "Markenname, Positionierung, Tone of Voice & visuelle Richtung festlegen" },
  { num: 3, title: "Business Calculator", desc: "Kosten kalkulieren, Preise simulieren, Break-Even berechnen" },
  { num: 4, title: "Production Planning", desc: "Lieferanten finden, MOQ klären, Produktionscheckliste abarbeiten" },
  { num: 5, title: "Packaging & Compliance", desc: "Verpackung designen, Etikettierung prüfen, rechtliche Anforderungen erfüllen" },
  { num: 6, title: "Sales Foundation", desc: "Vertriebskanal wählen, Fulfillment planen, erste Verkaufsstrategie aufbauen" },
  { num: 7, title: "Launch Roadmap", desc: "Timeline erstellen, Go-Live-Checkliste durchgehen, Marke starten" },
];

const STEPS_EN = [
  { num: 1, title: "Idea Foundation", desc: "Validate your product idea, define target audience, assess market opportunity" },
  { num: 2, title: "Brand Structure", desc: "Set brand name, positioning, tone of voice & visual direction" },
  { num: 3, title: "Business Calculator", desc: "Calculate costs, simulate pricing, compute break-even" },
  { num: 4, title: "Production Planning", desc: "Find suppliers, clarify MOQ, work through production checklist" },
  { num: 5, title: "Packaging & Compliance", desc: "Design packaging, check labeling, meet legal requirements" },
  { num: 6, title: "Sales Foundation", desc: "Choose sales channel, plan fulfillment, build first sales strategy" },
  { num: 7, title: "Launch Roadmap", desc: "Create timeline, complete go-live checklist, launch your brand" },
];

export function blueprintEmail(params: BlueprintParams): EmailOutput {
  const { locale = "de", firstName } = params;
  const de = locale === "de";
  const steps = de ? STEPS_DE : STEPS_EN;

  const greeting = firstName
    ? (de ? `Hallo ${firstName},` : `Hi ${firstName},`)
    : (de ? "Hallo!" : "Hi!");

  const subject = de
    ? "Dein 7-Schritte-Blueprint zum Markenaufbau"
    : "Your 7-Step Brand Building Blueprint";

  const intro = de
    ? "Hier ist dein persönlicher Blueprint – die 7 Schritte von der Idee bis zum Launch deiner Eigenmarke:"
    : "Here's your personal blueprint – the 7 steps from idea to launching your own brand:";

  const stepsHtml = steps
    .map(
      (s) =>
        `<tr>
          <td style="width:40px;vertical-align:top;padding:12px 0;">
            <div style="width:32px;height:32px;border-radius:50%;background:#18181b;color:#fff;font-weight:700;font-size:14px;line-height:32px;text-align:center;">${s.num}</div>
          </td>
          <td style="padding:12px 0 12px 12px;">
            <strong style="font-size:15px;color:#18181b;">${s.title}</strong><br>
            <span style="font-size:13px;color:#71717a;">${s.desc}</span>
          </td>
        </tr>`
    )
    .join("\n");

  const ctaLabel = de ? "Jetzt starten" : "Get started";
  const outroText = de
    ? "Starte jetzt mit Schritt 1 und arbeite dich durch – dein Dashboard führt dich."
    : "Start with step 1 and work your way through – your dashboard will guide you.";

  const bodyHtml = `
    <p>${greeting}</p>
    <h1>${subject}</h1>
    <p>${intro}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      ${stepsHtml}
    </table>
    <p>${outroText}</p>
    <a href="${APP_URL}/dashboard" class="cta">${ctaLabel}</a>
  `;

  const stepsText = steps.map((s) => `${s.num}. ${s.title} – ${s.desc}`).join("\n");

  const text = [
    greeting,
    "",
    subject,
    "",
    intro,
    "",
    stepsText,
    "",
    outroText,
    "",
    `${ctaLabel}: ${APP_URL}/dashboard`,
    "",
    `Support: ${SUPPORT_EMAIL}`,
  ].join("\n");

  return { subject, html: wrapLayout(bodyHtml, locale), text };
}
