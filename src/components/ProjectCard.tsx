import Link from 'next/link';
import type { Project } from '@/content/types';
import { areaName, formatAed, formatHandover, planSummary, UNIT_LABEL } from '@/lib/projects';
import CompareToggle from './CompareToggle';

export function DemoBadge() {
  return <span className="badge-demo" title="Fictional placeholder record — not a real project">Demo data</span>;
}

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="project-card">
      <div className="pc-top">
        <span className="pc-area">{areaName(p.area)}</span>
        {p.status === 'demo' && <DemoBadge />}
      </div>
      <h3><Link href={`/projects/${p.slug}/`}>{p.name}</Link></h3>
      <p className="pc-dev">{p.developer}</p>
      <dl className="pc-facts">
        <div><dt>Starting price</dt><dd>{formatAed(p.startingPriceAed)}</dd></div>
        <div><dt>Payment plan</dt><dd>{planSummary(p)}</dd></div>
        <div><dt>Expected handover</dt><dd>{formatHandover(p.expectedHandover)}</dd></div>
        <div><dt>Units</dt><dd>{p.unitTypes.map((u) => UNIT_LABEL[u]).join(', ')}</dd></div>
      </dl>
      <div className="pc-actions">
        <Link href={`/projects/${p.slug}/`} className="link-dark">View details</Link>
        <CompareToggle slug={p.slug} />
      </div>
    </article>
  );
}
