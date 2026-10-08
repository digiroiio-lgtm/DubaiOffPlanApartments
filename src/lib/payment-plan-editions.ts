import { editions as allEditions } from '@/content/payment-plan-snapshots';
import { projects } from '@/content/projects';
import type { PaymentPlanEdition } from '@/content/types';
import { isEditionIndexable } from './payment-plan-report';
import { showDemoContent } from './site';

/** Editions that may be rendered: published always, demo only when enabled, drafts never. Newest first. */
export function visibleEditions(): PaymentPlanEdition[] {
  const demo = showDemoContent();
  return allEditions.filter((e) => e.status === 'published' || (demo && e.status === 'demo'));
}

export function getEdition(month: string) {
  return visibleEditions().find((e) => e.month === month);
}

/** The edition this one is compared with: the previous visible edition of the same kind. */
export function previousEdition(ed: PaymentPlanEdition): PaymentPlanEdition | null {
  return visibleEditions().find((e) => e.month < ed.month && (e.status === 'demo') === (ed.status === 'demo')) ?? null;
}

export function editionIndexable(ed: PaymentPlanEdition) {
  return isEditionIndexable(ed, projects);
}

export function latestIndexableEdition() {
  return visibleEditions().find(editionIndexable) ?? null;
}
