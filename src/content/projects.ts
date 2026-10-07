import type { Project, UnitType } from './types';

/**
 * Central project data.
 *
 * HOW TO ADD A REAL PROJECT
 * 1. Use partner-supplied data you are allowed to publish, or the developer's official site/brochure.
 * 2. Fill every field you can verify. Leave unknown values as null - they render as "Not published".
 * 3. Set sourceUrl + sourceLabel + lastChecked (ISO date of your check).
 * 4. Only then set status: 'verified'. Everything else stays 'draft' (hidden) until verified.
 * Never copy text or images from other portals. Never invent prices, availability or handover dates.
 *
 * Current state: no project has been verified yet. The 20 records below are fictional DEMO
 * records used to exercise the filters, detail pages and comparison. They are labelled as demo
 * on every page, excluded from the sitemap and served with noindex. Set SHOW_DEMO_CONTENT=false
 * to hide them entirely.
 */

type DemoSeed = [
  area: string,
  units: UnitType[],
  price: number | null,
  initial: number | null,
  plan: [number, number, number, number] | null, // booking, construction, handover, post-handover
  handover: [number, 1 | 2 | 3 | 4] | null,
];

const seeds: DemoSeed[] = [
  ['jvc', ['studio', '1br', '2br'], 720000, 20, [20, 40, 40, 0], [2027, 4]],
  ['jvc', ['1br', '2br'], 950000, 10, [10, 40, 20, 30], [2028, 2]],
  ['jvc', ['studio', '1br'], 640000, 20, [20, 30, 50, 0], [2027, 2]],
  ['jvc', ['2br', '3br'], 1450000, 20, [20, 40, 0, 40], [2028, 4]],
  ['business-bay', ['1br', '2br'], 1650000, 20, [20, 40, 40, 0], [2027, 3]],
  ['business-bay', ['studio', '1br', '2br', '3br'], 1250000, 10, [10, 50, 40, 0], [2028, 1]],
  ['business-bay', ['2br', '3br', '4br+'], 3900000, 20, [20, 50, 30, 0], [2029, 2]],
  ['business-bay', ['1br', '2br'], null, null, null, [2028, 3]],
  ['dubai-south', ['studio', '1br', '2br'], 560000, 10, [10, 40, 0, 50], [2028, 2]],
  ['dubai-south', ['1br', '2br', '3br'], 830000, 20, [20, 40, 40, 0], [2027, 4]],
  ['dubai-south', ['2br', '3br'], 1150000, 10, [10, 50, 40, 0], [2029, 1]],
  ['dubai-south', ['studio', '1br'], 495000, 10, [10, 30, 20, 40], null],
  ['dubai-creek-harbour', ['1br', '2br', '3br'], 1850000, 10, [10, 70, 20, 0], [2028, 4]],
  ['dubai-creek-harbour', ['2br', '3br', '4br+'], 2950000, 10, [10, 60, 30, 0], [2029, 3]],
  ['dubai-creek-harbour', ['1br', '2br'], 1550000, 20, [20, 50, 30, 0], [2027, 4]],
  ['dubai-creek-harbour', ['3br', '4br+'], 5200000, 10, [10, 70, 20, 0], [2030, 1]],
  ['dubai-maritime-city', ['studio', '1br', '2br'], 1100000, 20, [20, 50, 30, 0], [2028, 1]],
  ['dubai-maritime-city', ['1br', '2br', '3br'], 1700000, 10, [10, 50, 0, 40], [2028, 4]],
  ['dubai-maritime-city', ['2br', '3br'], 2650000, 20, [20, 40, 40, 0], [2029, 2]],
  ['dubai-maritime-city', ['1br', '2br'], null, 20, [20, 40, 40, 0], null],
];

const AREA_LABEL: Record<string, string> = {
  jvc: 'JVC',
  'business-bay': 'Business Bay',
  'dubai-south': 'Dubai South',
  'dubai-creek-harbour': 'Dubai Creek Harbour',
  'dubai-maritime-city': 'Dubai Maritime City',
};

function demoPlan(p: DemoSeed[4]): Project['paymentPlan'] {
  if (!p) return null;
  const [booking, construction, handover, post] = p;
  const out = [
    { stage: 'On booking', percent: booking },
    { stage: 'During construction', percent: construction },
  ];
  if (handover) out.push({ stage: 'On handover', percent: handover });
  if (post) out.push({ stage: 'Post-handover', percent: post });
  return out;
}

const demoProjects: Project[] = seeds.map(([area, units, price, initial, plan, handover], i) => {
  const n = String(i + 1).padStart(2, '0');
  return {
    slug: `demo-project-${n}`,
    name: `Demo Project ${n} · ${AREA_LABEL[area]}`,
    developer: 'Demo developer (placeholder)',
    area,
    status: 'demo',
    summary:
      'Placeholder record used to preview the site templates. This is not a real project and the figures are illustrative only.',
    unitTypes: units,
    startingPriceAed: price,
    initialPaymentPercent: initial,
    paymentPlan: demoPlan(plan),
    expectedHandover: handover ? { year: handover[0], quarter: handover[1] } : null,
    floorPlans: [],
    media: [],
    brochureUrl: null,
    sourceUrl: null,
    sourceLabel: null,
    lastChecked: null,
  };
});

/** Add verified / draft real projects here. */
const realProjects: Project[] = [];

export const projects: Project[] = [...realProjects, ...demoProjects];
