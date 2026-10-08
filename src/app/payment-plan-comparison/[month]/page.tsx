import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { DemoStrip, months, pct } from '@/components/PaymentPlanParts';
import { projects } from '@/content/projects';
import { editionIndexable, getEdition, previousEdition, visibleEditions } from '@/lib/payment-plan-editions';
import {
  CHANGE_LABEL_TEXT, DATA_LICENSE_URL, diffEditions, FIELD_TEXT, headlineFindings, MIN_AREA_SAMPLE, monthLabel,
  summarizeByArea, summarizeEdition, type RowChange,
} from '@/lib/payment-plan-report';
import { areaName } from '@/lib/projects';
import { paymentPlanEditionJsonLd } from '@/lib/schema';

export const dynamicParams = false;
export function generateStaticParams() { return visibleEditions().map((e) => ({ month: e.month })); }
type P = Promise<{ month: string }>;

const BASE = '/payment-plan-comparison/';
const titleFor = (month: string) => `Dubai Off-Plan Payment Plan Comparison: ${monthLabel(month)}`;
const projectOf = (slug: string) => projects.find((p) => p.slug === slug);
const fmtField = (field: string, v: number | null) => (field === 'postHandoverMonths' ? months(v) : pct(v));

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const ed = getEdition((await params).month);
  if (!ed) return {};
  const s = summarizeEdition(ed);
  return {
    title: { absolute: titleFor(ed.month) },
    description: `Down payment, construction, handover and post-handover terms of ${s.tracked} Dubai off-plan projects, checked against developers' official documents in ${monthLabel(ed.month)}.`,
    alternates: { canonical: `${BASE}${ed.month}/` },
    robots: { index: editionIndexable(ed), follow: true },
  };
}

function changeText(c: RowChange) {
  if (c.type === 'added') return 'Newly tracked this month.';
  if (c.type === 'removed') return 'No longer tracked.';
  return c.changes.map((x) => `${FIELD_TEXT[x.field]} ${fmtField(x.field, x.from)} → ${fmtField(x.field, x.to)}`).join('; ') + '.';
}

export default async function EditionPage({ params }: { params: P }) {
  const ed = getEdition((await params).month);
  if (!ed) notFound();
  const demo = ed.status === 'demo';
  const prev = previousEdition(ed);
  const findings = headlineFindings(ed, prev, projects, areaName);
  const byArea = summarizeByArea(ed, projects);
  const changes = diffEditions(prev, ed);
  const changeFor = (slug: string) => changes.find((c) => c.projectSlug === slug);
  const csvPath = `${BASE}${ed.month}/data.csv`;
  const summary = summarizeEdition(ed);
  const ld = editionIndexable(ed) && ed.publishedAt
    ? paymentPlanEditionJsonLd({
        month: ed.month, title: titleFor(ed.month), path: `${BASE}${ed.month}/`, csvPath, publishedAt: ed.publishedAt,
        description: `Payment terms of ${summary.tracked} Dubai off-plan projects checked against developers' official documents.`,
        sourceUrls: [...new Set(ed.rows.map((r) => r.sourceUrl).filter((u): u is string => !!u))], license: DATA_LICENSE_URL,
      })
    : null;

  return (
    <div className="container page report">
      <Breadcrumbs items={[{ name: 'Payment plan comparison', href: BASE }, { name: monthLabel(ed.month), href: `${BASE}${ed.month}/` }]} />
      <h1 className="h-page">{titleFor(ed.month)}</h1>
      <p className="lead">
        Payment terms of {summary.tracked} off-plan projects, each checked against the developer&apos;s official documents.
        Methodology v{ed.methodologyVersion}{ed.publishedAt && <> · Published {new Date(ed.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</>}.
      </p>
      {demo && <p className="notice"><strong>Demo edition.</strong> Every number on this page is computed from fictional demo projects to preview the report. It is not market data and is not indexed.</p>}

      <h2 className="h-sub">Key findings</h2>
      <DemoStrip show={demo} />
      <ul className="findings">{findings.map((f) => <li key={f}>{f}</li>)}</ul>

      <h2 className="h-sub">Payment terms by area</h2>
      <DemoStrip show={demo} />
      <p className="muted small">Medians of the share of the price paid at each stage. Areas with fewer than {MIN_AREA_SAMPLE} projects show counts only; the post-handover period needs at least {MIN_AREA_SAMPLE} projects with post-handover payments (— otherwise).</p>
      <div className="table-wrap">
        <table className="data-table num-table">
          <thead><tr><th>Area</th><th>Projects</th><th>With post-handover</th><th>Down payment</th><th>During construction</th><th>On handover</th><th>Post-handover period</th></tr></thead>
          <tbody>{byArea.map((a) => (
            <tr key={a.area}>
              <th scope="row"><Link href={`/areas/${a.area}/`}>{areaName(a.area)}</Link></th>
              <td>{a.tracked}</td><td>{a.withPostHandover}</td>
              {a.sufficient
                ? <><td>{pct(a.medianDown)}</td><td>{pct(a.medianConstruction)}</td><td>{pct(a.medianOnHandover)}</td><td>{months(a.medianPostHandoverMonths)}</td></>
                : <td colSpan={4} className="muted">Too few projects for a median</td>}
            </tr>
          ))}</tbody>
        </table>
      </div>

      <h2 className="h-sub">Project-by-project terms</h2>
      <DemoStrip show={demo} />
      <div className="table-wrap">
        <table className="data-table num-table">
          <thead><tr><th>Project</th><th>Down payment</th><th>During construction</th><th>On handover</th><th>After handover</th><th>Post-handover period</th><th>Change vs {prev ? monthLabel(prev.month) : 'last month'}</th><th>Source</th></tr></thead>
          <tbody>{ed.rows.map((r) => {
            const p = projectOf(r.projectSlug);
            const c = changeFor(r.projectSlug);
            return (
              <tr key={r.projectSlug}>
                <th scope="row" className="proj-cell"><Link href={`/projects/${r.projectSlug}/`}>{p?.name ?? r.projectSlug}</Link>{p && <span className="cell-sub">{areaName(p.area)}</span>}</th>
                <td>{pct(r.downPaymentPct)}</td><td>{pct(r.constructionPct)}</td><td>{pct(r.onHandoverPct)}</td><td>{pct(r.postHandoverPct)}</td>
                <td>{months(r.postHandoverMonths)}</td>
                <td>{!prev ? '—' : !c ? 'No change' : c.type === 'added' ? 'New' : c.type === 'changed' ? (c.labels.map((l) => CHANGE_LABEL_TEXT[l]).join(', ') || 'Changed') : '—'}</td>
                <td className="src-cell">{r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="nofollow noopener">{r.sourceLabel}</a> : r.sourceLabel}<span className="cell-sub">Checked {r.checkedAt}</span></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      {prev && (
        <>
          <h2 className="h-sub">Changes since {monthLabel(prev.month)}</h2>
          <DemoStrip show={demo} />
          {changes.length ? (
            <ul className="changes">{changes.map((c) => (
              <li key={`${c.type}-${c.projectSlug}`}>
                <strong>{projectOf(c.projectSlug)?.name ?? c.projectSlug}</strong>: {changeText(c)}
                {c.type === 'changed' && c.labels.map((l) => <span key={l} className="tag">{CHANGE_LABEL_TEXT[l]}</span>)}
              </li>
            ))}</ul>
          ) : <p className="muted">No changes to tracked terms.</p>}
        </>
      )}

      <h2 className="h-sub">Download the data</h2>
      <p>
        <a href={csvPath} className="link-dark" data-cta="report_download" data-report-month={ed.month}>Download CSV ({ed.rows.length} rows)</a>
        {' '}· Licensed under <a href={DATA_LICENSE_URL} target="_blank" rel="noopener license">CC BY 4.0</a>: reuse freely with credit to DubaiOffPlanApartments.com and a link to this page.
      </p>

      <h2 className="h-sub">How this comparison is made</h2>
      <p>We record each project&apos;s payment terms from the developer&apos;s own page, brochure or payment-plan document, note the date we checked it, and compute medians per area. Read the full <Link href={`${BASE}methodology/`}>methodology</Link>.</p>
      {ed.corrections?.length ? (<><h2 className="h-sub">Corrections</h2><ul>{ed.corrections.map((x) => <li key={x.date + x.text}>{x.date}: {x.text}</li>)}</ul></>) : null}
      <p className="notice">Payment terms change and can differ by unit, floor and launch phase. This comparison is general information, not financial advice; confirm the current terms with the developer before you pay anything.</p>

      <p style={{ marginTop: 24 }}>
        <a href="/#match-form" className="btn btn-green report-cta" data-cta="find_my_3_matches" data-cta-location="payment_plan_comparison">Get matched to projects that fit your budget</a>
      </p>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
    </div>
  );
}
