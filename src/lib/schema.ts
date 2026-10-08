import { SITE_NAME, SITE_TAGLINE, siteUrl } from './site';

/**
 * Site-wide structured data. Only facts that are true today: no legal name, address, phone,
 * social profiles or ratings until the operator supplies them (see docs: Phase 2 SEO plan).
 */
export function siteJsonLd() {
  const orgId = siteUrl('/#organization');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        url: siteUrl('/'),
        logo: { '@type': 'ImageObject', url: siteUrl('/logo-512.png'), width: 512, height: 512 },
        description: SITE_TAGLINE,
        areaServed: { '@type': 'City', name: 'Dubai' },
      },
      {
        '@type': 'WebSite',
        '@id': siteUrl('/#website'),
        name: SITE_NAME,
        url: siteUrl('/'),
        inLanguage: 'en',
        publisher: { '@id': orgId },
      },
    ],
  };
}
