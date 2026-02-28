// ─── Shared HTML email layout for BrandOS ────────────────────────────
// To rename the brand, change BRAND_NAME below.

const BRAND_NAME = "BuildYourBrand";

const APP_URL = "https://ideatolaunch-hub.lovable.app";
const SUPPORT_EMAIL = "support@aldenairperfumes.de";
const LEGAL_URLS = {
  impressum: `${APP_URL}/impressum`,
  datenschutz: `${APP_URL}/datenschutz`,
  agb: `${APP_URL}/agb`,
};

export { BRAND_NAME, APP_URL, SUPPORT_EMAIL, LEGAL_URLS };

export type Locale = "de" | "en";

/**
 * Wraps email body HTML in a consistent, mobile-friendly layout.
 */
export function wrapLayout(bodyHtml: string, locale: Locale = "de"): string {
  const footerSupport =
    locale === "de"
      ? `Fragen? Schreib uns: ${SUPPORT_EMAIL}`
      : `Questions? Contact us: ${SUPPORT_EMAIL}`;

  return `<!DOCTYPE html>
<html lang="${locale}" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${BRAND_NAME}</title>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#18181b; -webkit-text-size-adjust:100%; }
    .wrapper { width:100%; padding:32px 16px; }
    .card { max-width:600px; margin:0 auto; background:#ffffff; border:1px solid #e4e4e7; border-radius:8px; overflow:hidden; }
    .header { padding:24px 32px; border-bottom:1px solid #f4f4f5; }
    .header-brand { font-size:18px; font-weight:700; color:#18181b; text-decoration:none; }
    .body { padding:32px; }
    .body h1 { font-size:20px; font-weight:700; margin:0 0 16px; color:#18181b; line-height:1.3; }
    .body p { font-size:14px; line-height:1.7; margin:0 0 14px; color:#3f3f46; }
    .body ul { padding-left:20px; margin:0 0 16px; }
    .body li { font-size:14px; line-height:1.8; color:#3f3f46; }
    .cta { display:inline-block; padding:12px 28px; background:#18181b; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:14px; font-weight:600; margin:8px 0 20px; }
    .secondary-link { font-size:13px; color:#71717a; text-decoration:underline; }
    .note { font-size:13px; color:#71717a; line-height:1.6; margin:16px 0 0; padding-top:16px; border-top:1px solid #f4f4f5; }
    .footer { padding:20px 32px; border-top:1px solid #f4f4f5; font-size:12px; color:#a1a1aa; line-height:1.7; }
    .footer a { color:#a1a1aa; text-decoration:underline; }
    @media (max-width:640px) {
      .body, .header, .footer { padding-left:20px !important; padding-right:20px !important; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="header">
      <span class="header-brand">${BRAND_NAME}</span>
    </div>
    <div class="body">
      ${bodyHtml}
    </div>
    <div class="footer">
      ${footerSupport}<br>
      &copy; ${new Date().getFullYear()} ${BRAND_NAME}<br>
      <a href="${LEGAL_URLS.impressum}">Impressum</a> &middot;
      <a href="${LEGAL_URLS.datenschutz}">Datenschutz</a> &middot;
      <a href="${LEGAL_URLS.agb}">AGB</a>
    </div>
  </div>
</div>
</body>
</html>`;
}
