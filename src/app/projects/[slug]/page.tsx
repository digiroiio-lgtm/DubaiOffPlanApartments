import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import CompareToggle, { CompareBar } from '@/components/CompareToggle';
import LeadForm from '@/components/LeadForm';
import { DemoBadge } from '@/components/ProjectCard';
import { areaName, formatAed, formatHandover, getPublicProject, isIndexable, publicProjects, UNIT_LABEL } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

export const dynamicParams = false;
export function generateStaticParams() { return publicProjects().map((p) => ({ slug: p.slug })); }

type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const p = getPublicProject((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name}: Payment Plan, Prices & Handover`,
    description: `${p.name} in ${areaName(p.area)} by ${p.developer}. Payment plan, starting price, unit types and expected handover.`,
    alternates: { canonical: `/projects/${p.slug}/` },
    robots: { index: isIndexable(p), follow: true },
  };
}

export default async function ProjectPage({ params }: { params: P }) {
  const p = getPublicProject((await params).slug);
  if (!p) notFound();
  // Structured data only for verified projects; no price/offer markup unless verified, never ratings.
  const ld = isIndexable(p) ? {
    '@context': 'https://schema.org', '@type': 'ApartmentComplex', name: p.name, url: siteUrl(`/projects/${p.slug}/`),
    address: { '@type': 'PostalAddress', addressLocality: areaName(p.area), addressRegion: 'Dubai', addressCountry: 'AE' },
  } : null;
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Projects', href: '/projects/' }, { name: p.name, href: `/projects/${p.slug}/` }]} />
      <div className="detail-layout">
        <div>
          <div className="pc-top"><span className="pc-area">{areaName(p.area)}</span>{p.status === 'demo' && <DemoBadge />}</div>
          <h1 className="h-page">{p.name}</h1>
          <p className="lead">{p.summary}</p>
          {p.status === 'demo' && <p className="notice">This is a <strong>fictional demo record</strong>. Figures are placeholders and do not describe a real project.</p>}

          <h2 className="h-sub">Key details</h2>
          <dl className="facts-table">
            <div><dt>Developer</dt><dd>{p.developer}</dd></div>
            <div><dt>Area</dt><dd><Link href={`/areas/${p.area}/`}>{areaName(p.area)}</Link></dd></div>
            <div><dt>Apartment types</dt><dd>{p.unitTypes.map((u) => UNIT_LABEL[u]).join(', ')}</dd></div>
            <div><dt>Starting price</dt><dd>{formatAed(p.startingPriceAed)}</dd></div>
            <div><dt>Initial payment</dt><dd>{p.initialPaymentPercent != null ? `${p.initialPaymentPercent}%` : 'Not published'}</dd></div>
            <div><dt>Expected handover</dt><dd>{formatHandover(p.expectedHandover)}{p.expectedHandover && <small> (developer estimate, not guaranteed)</small>}</dd></div>
          </dl>

          <h2 className="h-sub">Payment schedule</h2>
          {p.paymentPlan ? (
            <table className="data-table"><thead><tr><th>Stage</th><th>Share of price</th></tr></thead>
              <tbody>{p.paymentPlan.map((m) => <tr key={m.stage}><td>{m.stage}</td><td>{m.percent}%</td></tr>)}</tbody></table>
          ) : <p className="muted">Not published yet.</p>}

          <h2 className="h-sub">Floor plans &amp; brochure</h2>
          {p.floorPlans.length || p.brochureUrl ? (
            <ul>{p.floorPlans.map((f) => <li key={f.url}><a href={f.url}>{f.label}</a></li>)}{p.brochureUrl && <li><a href={p.brochureUrl}>Brochure</a></li>}</ul>
          ) : <p className="muted">Not available yet. Ask an advisor for the latest floor plans.</p>}

          <h2 className="h-sub">Source</h2>
          <p className="muted">
            {p.sourceUrl ? <>Data from <a href={p.sourceUrl} rel="nofollow noopener" target="_blank">{p.sourceLabel ?? p.sourceUrl}</a>. </> : 'No source — not verified. '}
            {p.lastChecked ? `Last checked ${p.lastChecked}.` : ''} Prices and availability change; confirm with the developer before you commit.
          </p>
          <div style={{ marginTop: 20 }}><CompareToggle slug={p.slug} /></div>
        </div>
        <aside className="detail-aside"><LeadForm location="project_detail" defaultArea={p.area} /></aside>
      </div>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <CompareBar />
    </div>
  );
}
