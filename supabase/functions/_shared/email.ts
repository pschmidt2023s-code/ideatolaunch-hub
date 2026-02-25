const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "BuildYourBrand <noreply@buildyourbrand.de>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY not configured – skipping email");
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend API error [${res.status}]: ${body}`);
      return false;
    }

    const data = await res.json();
    console.log(`[email] Sent "${subject}" to ${to} (id: ${data.id})`);
    return true;
  } catch (err) {
    console.error("[email] Failed to send:", err);
    return false;
  }
}

// ─── Templates ───────────────────────────────────────────────────────

const DASHBOARD_URL = "https://ideatolaunch-hub.lovable.app/dashboard";
const SUPPORT_EMAIL = "support@buildyourbrand.de";

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a}
.container{max-width:520px;margin:40px auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5}
.header{padding:24px 32px;border-bottom:1px solid #eee}
.header span{font-weight:700;font-size:18px}
.body{padding:32px}
.body h1{font-size:20px;margin:0 0 16px}
.body p{font-size:14px;line-height:1.6;margin:0 0 12px;color:#444}
.body ul{padding-left:20px;margin:0 0 16px}
.body li{font-size:14px;line-height:1.8;color:#444}
.cta{display:inline-block;padding:12px 24px;background:#18181b;color:#fff!important;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;margin:8px 0 16px}
.footer{padding:24px 32px;border-top:1px solid #eee;font-size:12px;color:#888}
</style></head>
<body><div class="container">
<div class="header"><span>BuildYourBrand</span></div>
<div class="body">${body}</div>
<div class="footer">Bei Fragen: ${SUPPORT_EMAIL}<br>© ${new Date().getFullYear()} BuildYourBrand</div>
</div></body></html>`;
}

const PLAN_LABELS: Record<string, string> = { builder: "Builder", pro: "Pro" };
const PLAN_PRICES: Record<string, string> = { builder: "29 €/Monat", pro: "79 €/Monat" };

export function paymentSuccessEmail(plan: string, portalUrl?: string) {
  const label = PLAN_LABELS[plan] || plan;
  const price = PLAN_PRICES[plan] || "";

  const html = wrap(`
    <h1>Dein ${label}-Plan ist jetzt aktiv 🎉</h1>
    <ul>
      <li><strong>Plan:</strong> ${label}</li>
      <li><strong>Preis:</strong> ${price}</li>
      <li><strong>Abrechnung:</strong> Monatlich, automatische Verlängerung</li>
    </ul>
    <p>Du hast jetzt Zugriff auf alle ${label}-Funktionen.</p>
    <a href="${DASHBOARD_URL}" class="cta">Zum Dashboard →</a>
    ${portalUrl ? `<p><a href="${portalUrl}" style="color:#18181b;font-size:13px">Abo verwalten</a></p>` : ""}
  `);

  const text = `Dein ${label}-Plan ist aktiv.\nPlan: ${label}\nPreis: ${price}\nAbrechnung: Monatlich\n\nZum Dashboard: ${DASHBOARD_URL}\nSupport: ${SUPPORT_EMAIL}`;

  return { subject: "Dein Plan ist jetzt aktiv", html, text };
}

export function cancellationEmail(plan: string, accessUntil: string) {
  const label = PLAN_LABELS[plan] || plan;

  const html = wrap(`
    <h1>Dein Abo wurde gekündigt</h1>
    <ul>
      <li><strong>Plan:</strong> ${label}</li>
      <li><strong>Zugang bis:</strong> ${accessUntil}</li>
    </ul>
    <p>Du kannst dein Abo jederzeit reaktivieren.</p>
    <a href="${DASHBOARD_URL}/pricing" class="cta">Plan reaktivieren →</a>
  `);

  const text = `Dein ${label}-Abo wurde gekündigt.\nZugang bis: ${accessUntil}\n\nReaktivieren: ${DASHBOARD_URL}/pricing\nSupport: ${SUPPORT_EMAIL}`;

  return { subject: "Dein Abo wurde gekündigt", html, text };
}

export function upgradeEmail(oldPlan: string, newPlan: string) {
  const oldLabel = PLAN_LABELS[oldPlan] || oldPlan;
  const newLabel = PLAN_LABELS[newPlan] || newPlan;
  const price = PLAN_PRICES[newPlan] || "";

  const html = wrap(`
    <h1>Upgrade bestätigt: ${newLabel} 🚀</h1>
    <ul>
      <li><strong>Vorheriger Plan:</strong> ${oldLabel}</li>
      <li><strong>Neuer Plan:</strong> ${newLabel}</li>
      <li><strong>Preis:</strong> ${price}</li>
    </ul>
    <p>Deine neuen Funktionen sind sofort verfügbar.</p>
    <a href="${DASHBOARD_URL}" class="cta">Zum Dashboard →</a>
  `);

  const text = `Upgrade bestätigt: ${oldLabel} → ${newLabel}\nPreis: ${price}\n\nZum Dashboard: ${DASHBOARD_URL}\nSupport: ${SUPPORT_EMAIL}`;

  return { subject: `Upgrade auf ${newLabel} bestätigt`, html, text };
}
