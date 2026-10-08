import { projects } from './projects.ts';
import type { PaymentPlanEdition, PaymentPlanRow, Project } from './types.ts';

/**
 * Monthly Payment Plan Comparison editions (newest first).
 *
 * HOW TO ADD A REAL EDITION — see docs/payment-plan-comparison.md:
 * one row per VERIFIED project, values taken from the developer's official page/brochure/PDF,
 * sourceUrl + checkedAt + checkedBy filled, then `npm run report:check -- YYYY-MM` before
 * setting status: 'published'. Never copy figures from portals. Never estimate.
 *
 * Current state: no verified data. The two editions below are fictional DEMO editions built from
 * the demo projects so the pages and the month-over-month logic can be reviewed.
 */

function stage(p: Project, name: string): number {
  return p.paymentPlan?.find((m) => m.stage.toLowerCase().startsWith(name))?.percent ?? 0;
}

function demoRow(p: Project, checkedAt: string, override: Partial<PaymentPlanRow> = {}): PaymentPlanRow {
  const post = stage(p, 'post-handover');
  return {
    projectSlug: p.slug,
    downPaymentPct: stage(p, 'on booking'),
    constructionPct: stage(p, 'during construction'),
    onHandoverPct: stage(p, 'on handover'),
    postHandoverPct: post,
    postHandoverMonths: post ? 24 : null,
    sourceUrl: null,
    sourceLabel: 'Demo data — no source',
    checkedAt,
    checkedBy: 'DEMO',
    ...override,
  };
}

const demoWithPlans = projects.filter((p) => p.status === 'demo' && p.paymentPlan);

// October: every demo project with a plan except demo-project-20 (shows up as "no longer tracked").
const octoberOverrides: Record<string, Partial<PaymentPlanRow>> = {
  'demo-project-09': { postHandoverMonths: 36 },
};
const octoberRows = demoWithPlans
  .filter((p) => p.slug !== 'demo-project-20')
  .map((p) => demoRow(p, '2026-10-05', octoberOverrides[p.slug]));

// September: a few terms differ from October, and demo-project-19 was not tracked yet.
const septemberOverrides: Record<string, Partial<PaymentPlanRow>> = {
  'demo-project-02': { downPaymentPct: 20, constructionPct: 30 },
  'demo-project-09': { constructionPct: 50, postHandoverPct: 40, postHandoverMonths: 24 },
  'demo-project-15': { constructionPct: 55, onHandoverPct: 25 },
};
const septemberRows = demoWithPlans
  .filter((p) => p.slug !== 'demo-project-19')
  .map((p) => demoRow(p, '2026-09-04', septemberOverrides[p.slug]));

const demoEditions: PaymentPlanEdition[] = [
  { month: '2026-10', status: 'demo', publishedAt: '2026-10-07', methodologyVersion: '1.0', rows: octoberRows },
  { month: '2026-09', status: 'demo', publishedAt: '2026-09-07', methodologyVersion: '1.0', rows: septemberRows },
];

/** Add real editions here, newest first. */
const realEditions: PaymentPlanEdition[] = [];

export const editions: PaymentPlanEdition[] = [...realEditions, ...demoEditions].sort((a, b) => b.month.localeCompare(a.month));
