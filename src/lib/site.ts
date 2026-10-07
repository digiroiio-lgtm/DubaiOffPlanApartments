export const SITE_NAME = 'DubaiOffPlanApartments.com';
export const SITE_TAGLINE = 'Independent project discovery and buyer matching.';

export function siteUrl(path = '/'): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Demo projects are only rendered when explicitly enabled. They are never indexed. */
export function showDemoContent(): boolean {
  return (process.env.SHOW_DEMO_CONTENT ?? 'true') !== 'false';
}

/** WhatsApp link for "Talk to an advisor". Falls back to the contact page when not configured. */
export function advisorHref(): string {
  const n = (process.env.NEXT_PUBLIC_ADVISOR_WHATSAPP || '').replace(/\D/g, '');
  return n ? `https://wa.me/${n}` : '/contact/';
}
