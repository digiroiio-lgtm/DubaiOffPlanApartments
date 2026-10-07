import { areas } from '@/content/areas';
import { projects as allProjects } from '@/content/projects';
import type { Project, UnitType } from '@/content/types';
import { showDemoContent } from './site';

export const UNIT_LABEL: Record<UnitType, string> = { studio: 'Studio', '1br': '1 bed', '2br': '2 bed', '3br': '3 bed', '4br+': '4+ bed' };

/** Projects that may be rendered publicly: verified always, demo only when enabled. Drafts never. */
export function publicProjects(): Project[] {
  const demo = showDemoContent();
  return allProjects.filter((p) => p.status === 'verified' || (demo && p.status === 'demo'));
}
export function getPublicProject(slug: string) { return publicProjects().find((p) => p.slug === slug); }
export function isIndexable(p: Project) { return p.status === 'verified'; }
export function contentCounts() {
  const c = { verified: 0, draft: 0, demo: 0 };
  for (const p of allProjects) c[p.status]++;
  return c;
}

export function areaName(slug: string) { return areas.find((a) => a.slug === slug)?.name ?? slug; }

export function formatAed(n: number | null): string {
  if (n == null) return 'Not published';
  return `AED ${n.toLocaleString('en-US')}`;
}
export function formatHandover(h: Project['expectedHandover']): string {
  if (!h) return 'Not published';
  return h.quarter ? `Q${h.quarter} ${h.year}` : String(h.year);
}
export function planSummary(p: Project): string {
  if (!p.paymentPlan) return 'Not published';
  return p.paymentPlan.map((m) => m.percent).join('/');
}
export function hasPostHandover(p: Project) { return !!p.paymentPlan?.some((m) => /post-handover/i.test(m.stage) && m.percent > 0); }

/* ---------- Budget & payment-plan clusters, derived from data ---------- */
export const BUDGET_CLUSTERS = [
  { slug: 'under-1m', label: 'Under AED 1M', min: 0, max: 1_000_000 },
  { slug: '1m-2m', label: 'AED 1M – 2M', min: 1_000_000, max: 2_000_000 },
  { slug: '2m-3m', label: 'AED 2M – 3M', min: 2_000_000, max: 3_000_000 },
  { slug: '3m-plus', label: 'AED 3M+', min: 3_000_000, max: Infinity },
] as const;

export const PLAN_CLUSTERS = [
  { slug: 'post-handover', label: 'Post-handover payment plans', test: (p: Project) => hasPostHandover(p) },
  { slug: 'low-initial-payment', label: 'Initial payment of 10% or less', test: (p: Project) => p.initialPaymentPercent != null && p.initialPaymentPercent <= 10 },
] as const;

/** A cluster page may be indexed only with this many verified projects in it. */
export const MIN_VERIFIED_FOR_INDEX = 3;

export function budgetCluster(slug: string) { return BUDGET_CLUSTERS.find((c) => c.slug === slug); }
export function planCluster(slug: string) { return PLAN_CLUSTERS.find((c) => c.slug === slug); }
export function inBudget(p: Project, min: number, max: number) {
  return p.startingPriceAed != null && p.startingPriceAed >= min && p.startingPriceAed < max;
}
export function clusterIndexable(list: Project[]) { return list.filter(isIndexable).length >= MIN_VERIFIED_FOR_INDEX; }

/* ---------- Filtering for /projects/ ---------- */
export interface ProjectFilters { area?: string; budget?: string; unit?: string; handover?: string; plan?: string }
export const MAX_BUDGET_OPTIONS = [
  { value: '750000', label: 'Up to AED 750k' },
  { value: '1000000', label: 'Up to AED 1M' },
  { value: '1500000', label: 'Up to AED 1.5M' },
  { value: '2000000', label: 'Up to AED 2M' },
  { value: '3000000', label: 'Up to AED 3M' },
  { value: '5000000', label: 'Up to AED 5M' },
];

export function filterProjects(list: Project[], f: ProjectFilters) {
  let excludedNoPrice = 0;
  const out = list.filter((p) => {
    if (f.area && p.area !== f.area) return false;
    if (f.unit && !p.unitTypes.includes(f.unit as UnitType)) return false;
    if (f.handover) {
      if (!p.expectedHandover) return false;
      if (f.handover === 'later' ? p.expectedHandover.year < 2030 : p.expectedHandover.year > Number(f.handover)) return false;
    }
    if (f.plan === 'post-handover' && !hasPostHandover(p)) return false;
    if (f.plan === 'low-initial' && !(p.initialPaymentPercent != null && p.initialPaymentPercent <= 10)) return false;
    if (f.budget) {
      if (p.startingPriceAed == null) { excludedNoPrice++; return false; }
      if (p.startingPriceAed > Number(f.budget)) return false;
    }
    return true;
  });
  return { projects: out, excludedNoPrice };
}
