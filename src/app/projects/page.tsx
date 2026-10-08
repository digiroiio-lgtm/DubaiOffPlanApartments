import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CompareBar } from '@/components/CompareToggle';
import ProjectCard from '@/components/ProjectCard';
import { areas } from '@/content/areas';
import { BUDGET_CLUSTERS, filterProjects, MAX_BUDGET_OPTIONS, PLAN_CLUSTERS, publicProjects, UNIT_LABEL, type ProjectFilters } from '@/lib/projects';

type SP = Promise<Record<string, string | string[] | undefined>>;
const KEYS = ['area', 'budget', 'unit', 'handover', 'plan'] as const;

function readFilters(sp: Record<string, string | string[] | undefined>): ProjectFilters {
  const f: ProjectFilters = {};
  for (const k of KEYS) { const v = sp[k]; if (typeof v === 'string' && v && v.length < 40) f[k] = v; }
  return f;
}

/** Filter URL in a fixed parameter order, so every combination has exactly one canonical form. */
function filtersPath(f: ProjectFilters): string {
  const q = KEYS.filter((k) => f[k]).map((k) => `${k}=${encodeURIComponent(f[k]!)}`).join('&');
  return q ? `/projects/?${q}` : '/projects/';
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const f = readFilters(await searchParams);
  const filtered = Object.keys(f).length > 0;
  return {
    title: 'Dubai Off-Plan Projects: Filter by Area, Budget & Handover',
    description: 'Filter Dubai off-plan apartment projects by area, total budget, bedrooms, expected handover and payment plan.',
    // Self-referencing canonical. A filtered page is noindex, so its canonical must not point at a
    // different URL (canonical elsewhere + noindex sends conflicting signals).
    alternates: { canonical: filtersPath(f) },
    // The unfiltered list is indexed once verified projects exist; filter combinations never are.
    robots: { index: !filtered && publicProjects().some((p) => p.status === 'verified'), follow: true },
  };
}

export default async function ProjectsPage({ searchParams }: { searchParams: SP }) {
  const f = readFilters(await searchParams);
  const all = publicProjects();
  const { projects, excludedNoPrice } = filterProjects(all, f);
  const sel = (k: keyof ProjectFilters, v: string) => (f[k] === v ? { selected: true } : {});
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Projects', href: '/projects/' }]} />
      <h1 className="h-page">Dubai off-plan projects</h1>
      <p className="lead">Filter by area, total budget, bedrooms, expected handover and payment plan. Expected handover dates are the developer&apos;s estimate, not a guarantee.</p>
      {all.some((p) => p.status === 'demo') && (
        <p className="notice">Preview mode: the projects below are <strong>fictional demo records</strong> used to test the templates. Verified projects will replace them before launch.</p>
      )}

      <form className="filters" method="get" action="/projects/">
        <label>Area
          <select name="area" defaultValue={f.area ?? ''}>
            <option value="">All areas</option>
            {areas.map((a) => <option key={a.slug} value={a.slug} {...sel('area', a.slug)}>{a.name}</option>)}
          </select>
        </label>
        <label>Total budget
          <select name="budget" defaultValue={f.budget ?? ''}>
            <option value="">Any budget</option>
            {MAX_BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label>Bedrooms
          <select name="unit" defaultValue={f.unit ?? ''}>
            <option value="">Any</option>
            {Object.entries(UNIT_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label>Expected handover
          <select name="handover" defaultValue={f.handover ?? ''}>
            <option value="">Any time</option>
            <option value="2027">By end of 2027</option>
            <option value="2028">By end of 2028</option>
            <option value="2029">By end of 2029</option>
            <option value="later">2030 or later</option>
          </select>
        </label>
        <label>Payment plan
          <select name="plan" defaultValue={f.plan ?? ''}>
            <option value="">Any plan</option>
            <option value="post-handover">Post-handover payments</option>
            <option value="low-initial">Initial payment ≤ 10%</option>
          </select>
        </label>
        <div className="filters-actions">
          <button className="btn btn-green" type="submit">Apply filters</button>
          {Object.keys(f).length > 0 && <Link href="/projects/" className="link-dark">Reset</Link>}
        </div>
      </form>

      <p className="result-count" aria-live="polite">
        {projects.length} project{projects.length === 1 ? '' : 's'} found
        {excludedNoPrice > 0 && ` · ${excludedNoPrice} without a published price not shown for this budget`}
      </p>
      {projects.length ? (
        <div className="project-grid">{projects.map((p) => <ProjectCard key={p.slug} p={p} />)}</div>
      ) : (
        <div className="empty">
          <p>No projects match these filters yet.</p>
          <a href="/#match-form" className="btn btn-green" data-cta="find_my_3_matches" data-cta-location="projects_empty">Ask an advisor for matches</a>
        </div>
      )}

      <section className="cluster-links">
        <h2 className="h-sub">Browse by budget</h2>
        <ul>{BUDGET_CLUSTERS.map((c) => <li key={c.slug}><Link href={`/projects/budget/${c.slug}/`}>{c.label}</Link></li>)}</ul>
        <h2 className="h-sub">Browse by payment plan</h2>
        <ul>{PLAN_CLUSTERS.map((c) => <li key={c.slug}><Link href={`/projects/payment-plan/${c.slug}/`}>{c.label}</Link></li>)}</ul>
      </section>
      <CompareBar />
    </div>
  );
}
