import { SITE_NAME, SITE_TAGLINE, siteUrl } from './site.ts';

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

/**
 * Article + Dataset markup for a published Payment Plan Comparison edition. Not emitted for demo or
 * draft editions: fictional numbers must never be described to crawlers as a dataset.
 */
export function paymentPlanEditionJsonLd(opts: {
  month: string; title: string; description: string; path: string; csvPath: string;
  publishedAt: string; sourceUrls: string[]; license: string;
}) {
  const url = siteUrl(opts.path);
  const [y, m] = opts.month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const org = { '@id': siteUrl('/#organization') };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: opts.title,
        description: opts.description,
        url,
        mainEntityOfPage: url,
        datePublished: opts.publishedAt,
        dateModified: opts.publishedAt,
        author: org,
        publisher: org,
      },
      {
        '@type': 'Dataset',
        name: opts.title,
        description: opts.description,
        url,
        temporalCoverage: `${opts.month}-01/${last}`,
        spatialCoverage: { '@type': 'Place', name: 'Dubai, United Arab Emirates' },
        variableMeasured: ['Down payment (% of price)', 'Paid during construction (% of price)', 'Paid on handover (% of price)', 'Paid after handover (% of price)', 'Post-handover instalment period (months)'],
        creator: org,
        publisher: org,
        license: opts.license,
        isAccessibleForFree: true,
        isBasedOn: opts.sourceUrls,
        dateModified: opts.publishedAt,
        distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: siteUrl(opts.csvPath) }],
      },
    ],
  };
}
