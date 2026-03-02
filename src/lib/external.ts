/**
 * Allowlist of external domains that are permitted for openExternal().
 * Add new partner/supplier domains here.
 */
export const ALLOWED_EXTERNAL_DOMAINS: string[] = [
  // Supplier / packaging partners
  "multipack.de",
  "www.multipack.de",
  "boxup.nl",
  "www.boxup.nl",
  "stickergiant.com",
  "www.stickergiant.com",
  "stickergiant.de",
  "www.stickergiant.de",
  "bandwerk.de",
  "www.bandwerk.de",
  // Packaging suppliers
  "ecopack-solutions.de",
  "www.ecopack-solutions.de",
  "pharmabox.at",
  "www.pharmabox.at",
  "packstyle.nl",
  "www.packstyle.nl",
  "luxbox.de",
  "www.luxbox.de",
  "freshpack.de",
  "www.freshpack.de",
  "greenpack.eu",
  "www.greenpack.eu",
  "safeship.de",
  "www.safeship.de",
  // Addon suppliers
  "silkwrap.de",
  "www.silkwrap.de",
  "papeterie-studio.de",
  "www.papeterie-studio.de",
  "promoinsert.de",
  "www.promoinsert.de",
  // Stripe
  "stripe.com",
  "www.stripe.com",
  "checkout.stripe.com",
  // EU ODR
  "ec.europa.eu",
  // GitHub (releases / updates)
  "github.com",
  "raw.githubusercontent.com",
  // General partner domains (add more as needed)
  "alibaba.com",
  "www.alibaba.com",
  "made-in-china.com",
  "www.made-in-china.com",
];

/**
 * Check whether a URL's hostname is on the allowlist.
 * Returns true for any allowed domain or subdomain of an allowed domain.
 */
export function isAllowedExternalUrl(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:" && protocol !== "http:") return false;
    return ALLOWED_EXTERNAL_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}
