/**
 * Monthly Payment Plan Comparison: pure calculations (no framework imports, so they run under
 * `node --test`). Every number a page prints about an edition comes from these functions;
 * nothing is typed in by hand.
 */
import type { PaymentPlanEdition, PaymentPlanRow, Project } from '../content/types.ts';

export const METHODOLOGY_VERSION = '1.0';
/** An edition is indexable only with at least this many verified projects. */
export const MIN_PROJECTS_FOR_PUBLICATION = 20;
/** Below this many projects an area gets counts but no medians and no headline sentence. */
export const MIN_AREA_SAMPLE = 3;
export const DATA_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  const v = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  return Math.round(v * 10) / 10;
}

const hasPostHandover = (r: PaymentPlanRow) => r.postHandoverPct > 0;

/* ---------- validation ---------- */

export function validateEdition(ed: PaymentPlanEdition, projects: Project[]): string[] {
  const errors: string[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(ed.month)) errors.push(`Invalid month "${ed.month}" (expected YYYY-MM).`);
  if (ed.status === 'published' && !ed.publishedAt) errors.push('A published edition needs publishedAt.');
  const [y, m] = ed.month.split('-').map(Number);
  const monthEnd = Date.UTC(y, m, 0);
  const earliest = Date.UTC(y, m - 1, 1) - 31 * 864e5;
  const seen = new Set<string>();

  for (const r of ed.rows) {
    const at = `${r.projectSlug}:`;
    if (seen.has(r.projectSlug)) errors.push(`${at} listed more than once.`);
    seen.add(r.projectSlug);
    const p = projects.find((x) => x.slug === r.projectSlug);
    if (!p) errors.push(`${at} unknown project.`);
    else if (ed.status === 'published' && p.status !== 'verified') errors.push(`${at} project is "${p.status}"; a published edition may only include verified projects.`);

    const pcts = [r.downPaymentPct, r.constructionPct, r.onHandoverPct, r.postHandoverPct];
    if (pcts.some((v) => typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 100)) errors.push(`${at} percentages must be numbers between 0 and 100.`);
    else {
      const sum = pcts.reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 100) > 0.5) errors.push(`${at} percentages add up to ${sum}, not 100.`);
    }
    if (r.postHandoverPct > 0 && !(Number.isInteger(r.postHandoverMonths) && (r.postHandoverMonths as number) > 0))
      errors.push(`${at} post-handover share without a post-handover period in months.`);
    if (r.postHandoverPct === 0 && r.postHandoverMonths !== null) errors.push(`${at} post-handover months set but no post-handover share.`);

    if (ed.status !== 'demo') {
      if (!r.sourceUrl || !/^https:\/\//.test(r.sourceUrl)) errors.push(`${at} needs an https source URL from the developer.`);
      if (!r.sourceLabel) errors.push(`${at} needs a source label.`);
      if (!r.checkedBy) errors.push(`${at} needs checkedBy.`);
    }
    const t = Date.parse(r.checkedAt);
    if (Number.isNaN(t)) errors.push(`${at} invalid checkedAt "${r.checkedAt}".`);
    else if (t > monthEnd || t < earliest) errors.push(`${at} checkedAt ${r.checkedAt} is outside the edition window.`);
  }
  return errors;
}

export function isEditionIndexable(ed: PaymentPlanEdition, projects: Project[]): boolean {
  return ed.status === 'published' && ed.rows.length >= MIN_PROJECTS_FOR_PUBLICATION && validateEdition(ed, projects).length === 0;
}

/* ---------- summaries ---------- */

export interface GroupSummary {
  tracked: number;
  withPostHandover: number;
  sufficient: boolean; // tracked >= MIN_AREA_SAMPLE; medians are null otherwise
  medianDown: number | null;
  medianConstruction: number | null;
  medianOnHandover: number | null;
  medianPostHandoverMonths: number | null; // over projects that have post-handover payments
}

function summarize(rows: PaymentPlanRow[]): GroupSummary {
  const sufficient = rows.length >= MIN_AREA_SAMPLE;
  const ph = rows.filter(hasPostHandover);
  return {
    tracked: rows.length,
    withPostHandover: ph.length,
    sufficient,
    medianDown: sufficient ? median(rows.map((r) => r.downPaymentPct)) : null,
    medianConstruction: sufficient ? median(rows.map((r) => r.constructionPct)) : null,
    medianOnHandover: sufficient ? median(rows.map((r) => r.onHandoverPct)) : null,
    medianPostHandoverMonths: ph.length >= MIN_AREA_SAMPLE ? median(ph.map((r) => r.postHandoverMonths as number)) : null,
  };
}

export function summarizeEdition(ed: PaymentPlanEdition): GroupSummary {
  return summarize(ed.rows);
}

export function summarizeByArea(ed: PaymentPlanEdition, projects: Project[]): (GroupSummary & { area: string })[] {
  const byArea = new Map<string, PaymentPlanRow[]>();
  for (const r of ed.rows) {
    const area = projects.find((p) => p.slug === r.projectSlug)?.area;
    if (!area) continue;
    byArea.set(area, [...(byArea.get(area) ?? []), r]);
  }
  return [...byArea.entries()]
    .map(([area, rows]) => ({ area, ...summarize(rows) }))
    .sort((a, b) => b.tracked - a.tracked || a.area.localeCompare(b.area));
}

/* ---------- month-over-month changes ---------- */

export type ChangeLabel = 'lower-initial-payment' | 'later-payments';
export const CHANGE_LABEL_TEXT: Record<ChangeLabel, string> = {
  'lower-initial-payment': 'Lower initial payment',
  'later-payments': 'More paid after handover',
};

const FIELDS = ['downPaymentPct', 'constructionPct', 'onHandoverPct', 'postHandoverPct', 'postHandoverMonths'] as const;
export type Field = (typeof FIELDS)[number];
export const FIELD_TEXT: Record<Field, string> = {
  downPaymentPct: 'Down payment',
  constructionPct: 'During construction',
  onHandoverPct: 'On handover',
  postHandoverPct: 'After handover',
  postHandoverMonths: 'Post-handover period',
};

export type RowChange =
  | { type: 'added'; projectSlug: string }
  | { type: 'removed'; projectSlug: string }
  | { type: 'changed'; projectSlug: string; changes: { field: Field; from: number | null; to: number | null }[]; labels: ChangeLabel[] };

export function diffEditions(prev: PaymentPlanEdition | null, cur: PaymentPlanEdition): RowChange[] {
  if (!prev) return [];
  const out: RowChange[] = [];
  for (const r of cur.rows) {
    const p = prev.rows.find((x) => x.projectSlug === r.projectSlug);
    if (!p) { out.push({ type: 'added', projectSlug: r.projectSlug }); continue; }
    const changes = FIELDS.filter((f) => p[f] !== r[f]).map((f) => ({ field: f, from: p[f], to: r[f] }));
    if (!changes.length) continue;
    const labels: ChangeLabel[] = [];
    if (r.downPaymentPct < p.downPaymentPct) labels.push('lower-initial-payment');
    if (r.postHandoverPct > p.postHandoverPct || (r.postHandoverMonths ?? 0) > (p.postHandoverMonths ?? 0)) labels.push('later-payments');
    out.push({ type: 'changed', projectSlug: r.projectSlug, changes, labels });
  }
  for (const p of prev.rows) if (!cur.rows.some((r) => r.projectSlug === p.projectSlug)) out.push({ type: 'removed', projectSlug: p.projectSlug });
  return out;
}

/* ---------- headline findings (template sentences, computed numbers only) ---------- */

const projectsWord = (n: number) => (n === 1 ? 'project' : 'projects');
const offer = (n: number) => (n === 1 ? 'offers' : 'offer');

export function headlineFindings(
  ed: PaymentPlanEdition,
  prev: PaymentPlanEdition | null,
  projects: Project[],
  areaName: (slug: string) => string,
): string[] {
  const all = summarizeEdition(ed);
  if (!all.tracked) return [];
  const out = [`We tracked ${all.tracked} ${projectsWord(all.tracked)} in ${monthLabel(ed.month)}; ${all.withPostHandover ? `${all.withPostHandover} of them ${offer(all.withPostHandover)}` : 'none of them offer'} post-handover instalments.`];
  if (all.medianDown !== null) out.push(`The median down payment across tracked projects is ${all.medianDown}% of the price.`);
  for (const a of summarizeByArea(ed, projects)) {
    if (!a.sufficient) continue;
    out.push(`Of the ${a.tracked} ${projectsWord(a.tracked)} we track in ${areaName(a.area)}, ${a.withPostHandover ? `${a.withPostHandover} ${offer(a.withPostHandover)}` : 'none offer'} post-handover instalments.`);
  }
  if (prev) {
    const changed = diffEditions(prev, ed).filter((c) => c.type === 'changed');
    const lower = changed.filter((c) => c.type === 'changed' && c.labels.includes('lower-initial-payment')).length;
    out.push(`${changed.length} ${projectsWord(changed.length)} changed ${changed.length === 1 ? 'its' : 'their'} payment terms since ${monthLabel(prev.month)}; ${lower} now ${lower === 1 ? 'asks' : 'ask'} for a lower initial payment.`);
  }
  return out;
}

/* ---------- CSV ---------- */

const csvCell = (v: string | number | null | undefined) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const CSV_HEADER = ['month', 'project', 'project_slug', 'area', 'down_payment_pct', 'construction_pct', 'on_handover_pct', 'post_handover_pct', 'post_handover_months', 'source_label', 'source_url', 'checked_at', 'edition_status'];

export function toCsv(ed: PaymentPlanEdition, projects: Project[]): string {
  const lines = [CSV_HEADER.join(',')];
  for (const r of ed.rows) {
    const p = projects.find((x) => x.slug === r.projectSlug);
    lines.push([ed.month, p?.name, r.projectSlug, p?.area, r.downPaymentPct, r.constructionPct, r.onHandoverPct, r.postHandoverPct, r.postHandoverMonths, r.sourceLabel, r.sourceUrl, r.checkedAt, ed.status].map(csvCell).join(','));
  }
  return lines.join('\n') + '\n';
}
