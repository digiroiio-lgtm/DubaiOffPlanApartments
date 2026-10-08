import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PaymentPlanEdition, PaymentPlanRow, Project } from '../src/content/types.ts';
import {
  CSV_HEADER, diffEditions, headlineFindings, isEditionIndexable, median, MIN_PROJECTS_FOR_PUBLICATION,
  summarizeByArea, toCsv, validateEdition,
} from '../src/lib/payment-plan-report.ts';
import { editions } from '../src/content/payment-plan-snapshots.ts';
import { projects as siteProjects } from '../src/content/projects.ts';

const project = (slug: string, area: string, status: Project['status'] = 'verified'): Project => ({
  slug, name: `P ${slug}`, developer: 'Dev', area, status, summary: '', unitTypes: ['1br'], startingPriceAed: null,
  initialPaymentPercent: null, paymentPlan: null, expectedHandover: null, floorPlans: [], media: [],
  brochureUrl: null, sourceUrl: null, sourceLabel: null, lastChecked: null,
});
const row = (slug: string, o: Partial<PaymentPlanRow> = {}): PaymentPlanRow => ({
  projectSlug: slug, downPaymentPct: 20, constructionPct: 40, onHandoverPct: 40, postHandoverPct: 0, postHandoverMonths: null,
  sourceUrl: `https://developer.example/${slug}.pdf`, sourceLabel: 'Developer payment plan PDF', checkedAt: '2026-11-03', checkedBy: 'AB', ...o,
});
const edition = (rows: PaymentPlanRow[], o: Partial<PaymentPlanEdition> = {}): PaymentPlanEdition => ({
  month: '2026-11', status: 'published', publishedAt: '2026-11-06', methodologyVersion: '1.0', rows, ...o,
});
const projects = [
  project('a1', 'jvc'), project('a2', 'jvc'), project('a3', 'jvc'), project('a4', 'jvc'),
  project('b1', 'business-bay'), project('b2', 'business-bay'), project('d1', 'jvc', 'demo'),
];
const area = (s: string) => ({ jvc: 'JVC', 'business-bay': 'Business Bay' }[s] ?? s);

test('median handles odd, even and empty inputs', () => {
  assert.equal(median([30, 10, 20]), 20);
  assert.equal(median([10, 20, 30, 40]), 25);
  assert.equal(median([]), null);
});

test('a clean edition validates', () => {
  assert.deepEqual(validateEdition(edition([row('a1'), row('a2', { postHandoverPct: 30, onHandoverPct: 10, postHandoverMonths: 24 })]), projects), []);
});

test('percentages that do not add up to 100 are rejected', () => {
  const errs = validateEdition(edition([row('a1', { onHandoverPct: 30 })]), projects);
  assert.ok(errs.some((e) => e.includes('add up to 90')));
});

test('missing or non-https source is rejected outside demo editions', () => {
  assert.ok(validateEdition(edition([row('a1', { sourceUrl: null })]), projects).some((e) => e.includes('source URL')));
  assert.ok(validateEdition(edition([row('a1', { sourceUrl: 'http://x.example' })]), projects).some((e) => e.includes('source URL')));
  assert.deepEqual(validateEdition(edition([row('d1', { sourceUrl: null })], { status: 'demo' }), projects), []);
});

test('published editions may only contain verified projects', () => {
  assert.ok(validateEdition(edition([row('d1')]), projects).some((e) => e.includes('only include verified')));
});

test('post-handover share and months must agree; duplicates and stale checks are rejected', () => {
  assert.ok(validateEdition(edition([row('a1', { onHandoverPct: 10, postHandoverPct: 30 })]), projects).some((e) => e.includes('without a post-handover period')));
  assert.ok(validateEdition(edition([row('a1', { postHandoverMonths: 12 })]), projects).some((e) => e.includes('no post-handover share')));
  assert.ok(validateEdition(edition([row('a1'), row('a1')]), projects).some((e) => e.includes('more than once')));
  assert.ok(validateEdition(edition([row('a1', { checkedAt: '2026-08-01' })]), projects).some((e) => e.includes('outside the edition window')));
});

test('indexable only when published, valid and above the sample threshold', () => {
  const big = Array.from({ length: MIN_PROJECTS_FOR_PUBLICATION }, (_, i) => project(`v${i}`, 'jvc'));
  const rows = big.map((p) => row(p.slug));
  assert.equal(isEditionIndexable(edition(rows), big), true);
  assert.equal(isEditionIndexable(edition(rows.slice(1)), big), false);
  assert.equal(isEditionIndexable(edition(rows, { status: 'demo' }), big), false);
});

test('area medians are suppressed below the sample threshold', () => {
  const ed = edition([row('a1', { downPaymentPct: 10, constructionPct: 50 }), row('a2'), row('a3'), row('b1'), row('b2')]);
  const [jvc, bb] = summarizeByArea(ed, projects);
  assert.equal(jvc.area, 'jvc'); assert.equal(jvc.tracked, 3); assert.equal(jvc.medianDown, 20); assert.equal(jvc.sufficient, true);
  assert.equal(bb.tracked, 2); assert.equal(bb.sufficient, false); assert.equal(bb.medianDown, null);
});

test('changes are labelled only by the defined rules', () => {
  const prev = edition([row('a1'), row('a2'), row('a3'), row('a4')], { month: '2026-10' });
  const cur = edition([
    row('a1', { downPaymentPct: 10, constructionPct: 50 }), // lower initial payment
    row('a2', { onHandoverPct: 20, postHandoverPct: 20, postHandoverMonths: 24 }), // later payments
    row('a3', { constructionPct: 50, onHandoverPct: 30 }), // neutral change
    row('b1'), // added
  ]);
  const d = diffEditions(prev, cur);
  const by = (s: string) => d.find((c) => c.projectSlug === s)!;
  const labels = (s: string) => { const c = by(s); return c.type === 'changed' ? c.labels : null; };
  assert.deepEqual(labels('a1'), ['lower-initial-payment']);
  assert.deepEqual(labels('a2'), ['later-payments']);
  assert.deepEqual(labels('a3'), []);
  assert.equal(by('b1').type, 'added');
  assert.equal(by('a4').type, 'removed');
  assert.deepEqual(diffEditions(null, cur), []);
});

test('headline findings contain only computed numbers and skip thin areas', () => {
  const prev = edition([row('a1'), row('a2'), row('a3')], { month: '2026-10' });
  const cur = edition([
    row('a1', { downPaymentPct: 10, constructionPct: 50 }),
    row('a2', { onHandoverPct: 10, postHandoverPct: 30, postHandoverMonths: 24 }),
    row('a3'), row('b1'),
  ]);
  const f = headlineFindings(cur, prev, projects, area);
  assert.equal(f[0], 'We tracked 4 projects in November 2026; 1 of them offers post-handover instalments.');
  assert.ok(f.includes('Of the 3 projects we track in JVC, 1 offers post-handover instalments.'));
  assert.ok(!f.some((s) => s.includes('Business Bay')), 'area with 1 project gets no sentence');
  const none = headlineFindings(edition([row('a1'), row('a2'), row('a3')]), null, projects, area);
  assert.equal(none[0], 'We tracked 3 projects in November 2026; none of them offer post-handover instalments.');
  assert.ok(none.includes('Of the 3 projects we track in JVC, none offer post-handover instalments.'));
  assert.ok(f.includes('2 projects changed their payment terms since October 2026; 1 now asks for a lower initial payment.'));
});

test('CSV has the documented header and escapes values', () => {
  const csv = toCsv(edition([row('a1', { sourceLabel: 'Brochure, "Phase 2"' })]), projects);
  const [head, line] = csv.trim().split('\n');
  assert.equal(head, CSV_HEADER.join(','));
  assert.ok(line.includes('"Brochure, ""Phase 2"""'));
});

test('the bundled demo editions are internally valid', () => {
  for (const ed of editions) assert.deepEqual(validateEdition(ed, siteProjects), [], ed.month);
});

test('Article + Dataset markup for a published edition is complete and serialisable', async () => {
  const { paymentPlanEditionJsonLd } = await import('../src/lib/schema.ts');
  const ld = paymentPlanEditionJsonLd({
    month: '2026-11', title: 'Dubai Off-Plan Payment Plan Comparison: November 2026', description: 'd',
    path: '/payment-plan-comparison/2026-11/', csvPath: '/payment-plan-comparison/2026-11/data.csv',
    publishedAt: '2026-11-06', sourceUrls: ['https://developer.example/a.pdf'], license: 'https://creativecommons.org/licenses/by/4.0/',
  });
  const graph = JSON.parse(JSON.stringify(ld))['@graph'];
  const dataset = graph.find((x: { '@type': string }) => x['@type'] === 'Dataset');
  assert.ok(graph.some((x: { '@type': string }) => x['@type'] === 'Article'));
  assert.equal(dataset.temporalCoverage, '2026-11-01/2026-11-30');
  assert.equal(dataset.license, 'https://creativecommons.org/licenses/by/4.0/');
  assert.match(dataset.distribution[0].contentUrl, /\/payment-plan-comparison\/2026-11\/data\.csv$/);
  assert.equal(dataset.variableMeasured.length, 5);
  assert.ok(!JSON.stringify(ld).includes('aggregateRating'));
});
