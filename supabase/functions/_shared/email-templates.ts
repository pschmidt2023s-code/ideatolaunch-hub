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
