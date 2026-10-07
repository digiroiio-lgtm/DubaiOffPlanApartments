import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/Article';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import { getGuide, guides } from '@/content/guides';
import { siteUrl } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() { return guides.map((g) => ({ slug: g.slug })); }
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}/` }, openGraph: { type: 'article' } };
}

export default async function GuidePage({ params }: { params: P }) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, dateModified: g.updated, mainEntityOfPage: siteUrl(`/guides/${g.slug}/`), publisher: { '@type': 'Organization', name: 'DubaiOffPlanApartments.com' } };
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Buying Guide', href: '/guides/' }, { name: g.title, href: `/guides/${g.slug}/` }]} />
      <div className="detail-layout">
        <div>
          <h1 className="h-page">{g.title}</h1>
          <p className="lead">{g.description}</p>
          <ArticleBody doc={g} />
          <h2 className="h-sub">More guides</h2>
          <ul>{guides.filter((x) => x.slug !== g.slug).map((x) => <li key={x.slug}><Link href={`/guides/${x.slug}/`}>{x.title}</Link></li>)}</ul>
        </div>
        <aside className="detail-aside"><LeadForm location={`guide_${g.slug}`} /></aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
