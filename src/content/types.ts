export type UnitType = 'studio' | '1br' | '2br' | '3br' | '4br+';

/**
 * verified  - checked against an official developer / partner source; publishable and indexable.
 * draft     - real project, data incomplete or not yet verified; never rendered publicly.
 * demo      - fictional placeholder used to exercise templates; labelled on every page and noindex.
 */
export type ContentStatus = 'verified' | 'draft' | 'demo';

export interface PaymentMilestone {
  stage: string; // e.g. "On booking", "During construction", "On handover", "Post-handover (24 months)"
  percent: number;
}

export interface Project {
  slug: string;
  name: string;
  developer: string;
  area: string; // area slug
  status: ContentStatus;
  summary: string;
  unitTypes: UnitType[];
  /** Starting price in AED. null = not published / not verified. Never shown as 0. */
  startingPriceAed: number | null;
  /** Initial payment (booking + down payment) as % of price. */
  initialPaymentPercent: number | null;
  paymentPlan: PaymentMilestone[] | null;
  /** Expected handover as stated by the developer. Not a guarantee. */
  expectedHandover: { year: number; quarter?: 1 | 2 | 3 | 4 } | null;
  floorPlans: { label: string; url: string }[];
  /** Only media we have permission to use. */
  media: { url: string; alt: string; credit: string }[];
  brochureUrl: string | null;
  sourceUrl: string | null;
  sourceLabel: string | null;
  lastChecked: string | null; // ISO date
}

export interface Area {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  image: string | null;
  imageAlt: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  sources: { label: string; url: string }[];
  updated: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  sections: { heading: string; body: string[] }[];
  sources: { label: string; url: string }[];
  updated: string;
}
