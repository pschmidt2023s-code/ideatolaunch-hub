export const PARTNER_LINKS: Record<string, string> = {
  multipack: "https://multipack.de/",
  boxup: "https://boxup.nl/",
  stickergiant: "https://stickergiant.com/",
  bandwerk: "https://bandwerk.de/",
};

// optional: falls partnerId manchmal anders geschrieben ist
export function getPartnerUrl(partnerId?: string | null) {
  if (!partnerId) return null;
  const key = partnerId.trim().toLowerCase();
  return PARTNER_LINKS[key] ?? null;
}