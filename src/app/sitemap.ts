import type { MetadataRoute } from 'next';
import { areas } from '@/content/areas';
import { guides } from '@/content/guides';
import { BUDGET_CLUSTERS, clusterIndexable, inBudget, isIndexable, PLAN_CLUSTERS, publicProjects } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

/** Only indexable URLs: no demo/draft projects, no filter URLs, no thin clusters. */
export default function sitemap(): MetadataRoute.Sitemap {
  const projects = publicProjects().filter(isIndexable);
  const urls: MetadataRoute.Sitemap = [
    { url: siteUrl('/') },
    { url: siteUrl('/areas/') },
    { url: siteUrl('/guides/') },
    { url: siteUrl('/contact/') },
    { url: siteUrl('/privacy/') },
    { url: siteUrl('/terms/') },
    ...areas.map((a) => ({ url: siteUrl(`/areas/${a.slug}/`), lastModified: a.updated })),
    ...guides.map((g) => ({ url: siteUrl(`/guides/${g.slug}/`), lastModified: g.updated })),
  ];
  if (projects.length) urls.push({ url: siteUrl('/projects/') });
  for (const p of projects) urls.push({ url: siteUrl(`/projects/${p.slug}/`), lastModified: p.lastChecked ?? undefined });
  for (const c of BUDGET_CLUSTERS) if (clusterIndexable(publicProjects().filter((p) => inBudget(p, c.min, c.max)))) urls.push({ url: siteUrl(`/projects/budget/${c.slug}/`) });
  for (const c of PLAN_CLUSTERS) if (clusterIndexable(publicProjects().filter(c.test))) urls.push({ url: siteUrl(`/projects/payment-plan/${c.slug}/`) });
  return urls;
}
