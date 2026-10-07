import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import CompareTracker from '@/components/CompareTracker';
import { DemoBadge } from '@/components/ProjectCard';
import type { Project } from '@/content/types';
import { areaName, formatAed, formatHandover, getPublicProject, planSummary, publicProjects, UNIT_LABEL } from '@/lib/projects';

type SP = Promise<Record<string, string | string[] | undefined>>;

function selected(sp: Record<string, string | string[] | undefined>): string[] {
  const raw = [sp.p, sp.p1, sp.p2, sp.p3].flat().filter((v): v is string => typeof v === 'string');
  const slugs = raw.flatMap((v) => v.split(',')).map((s) => s.trim()).filter(Boolean);
  return [...new Set(slugs)].filter((s) => getPublicProject(s)).slice(0, 3);
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const s = selected(await searchParams);
  return {
    title: 'Compare Dubai Off-Plan Projects Side by Side',
    description: 'Compare up to three Dubai off-plan projects: starting price, payment schedule, expected handover and unit types.',
    alternates: { canonical: '/compare/' },
    robots: { index: s.length === 0, follow: true },
  };
}

const ROWS: [string, (p: Project) => React.ReactNode][] = [
  ['Area', (p) => areaName(p.area)],
  ['Developer', (p) => p.developer],
  ['Starting price', (p) => formatAed(p.startingPriceAed)],
  ['Initial payment', (p) => (p.initialPaymentPercent != null ? `${p.initialPaymentPercent}%` : 'Not published')],
  ['Payment schedule', (p) => planSummary(p)],
  ['Expected handover', (p) => formatHandover(p.expectedHandover)],
  ['Apartment types', (p) => p.unitTypes.map((u) => UNIT_LABEL[u]).join(', ')],
  ['Last checked', (p) => p.lastChecked ?? 'Not verified'],
];

export default async function ComparePage({ searchParams }: { searchParams: SP }) {
  const slugs = selected(await searchParams);
  const list = slugs.map((s) => getPublicProject(s)!);
  const options = publicProjects();
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Compare', href: '/compare/' }]} />
      <h1 className="h-page">Compare projects</h1>
      <p className="lead">Choose up to three projects to see them side by side. Missing data is shown as &ldquo;Not published&rdquo;, never as zero.</p>

      <form className="filters compare-picker" method="get" action="/compare/">
        {[0, 1, 2].map((i) => (
          <label key={i}>Project {String.fromCharCode(65 + i)}
            <select name={`p${i + 1}`} defaultValue={slugs[i] ?? ''}>
              <option value="">Select a project</option>
              {options.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </label>
        ))}
        <div className="filters-actions"><button className="btn btn-green" type="submit">Compare</button></div>
      </form>

      {list.length > 0 ? (
        <div className="table-wrap">
          <table className="data-table compare-table">
            <thead><tr><th scope="col"><span className="sr-only">Detail</span></th>{list.map((p) => (
              <th scope="col" key={p.slug}><Link href={`/projects/${p.slug}/`}>{p.name}</Link>{p.status === 'demo' && <><br /><DemoBadge /></>}</th>
            ))}</tr></thead>
            <tbody>{ROWS.map(([label, fn]) => (
              <tr key={label}><th scope="row">{label}</th>{list.map((p) => <td key={p.slug}>{fn(p)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="muted">No projects selected yet. Use &ldquo;+ Compare&rdquo; on any project, or pick from the lists above.</p>}
      <p style={{ marginTop: 24 }}>
        <a href="/#match-form" className="btn btn-green" data-cta="find_my_3_matches" data-cta-location="compare">Discuss these options with an advisor</a>
      </p>
      <CompareTracker slugs={slugs} />
    </div>
  );
}
