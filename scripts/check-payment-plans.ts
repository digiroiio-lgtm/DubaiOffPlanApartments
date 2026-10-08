// Validate a Monthly Payment Plan Comparison edition before publishing.
// Usage: npm run report:check -- 2026-11   (no month = check every edition)
import { editions } from '../src/content/payment-plan-snapshots.ts';
import { projects } from '../src/content/projects.ts';
import { isEditionIndexable, MIN_PROJECTS_FOR_PUBLICATION, validateEdition } from '../src/lib/payment-plan-report.ts';

const month = process.argv[2];
const list = month ? editions.filter((e) => e.month === month) : editions;
if (!list.length) {
  console.error(`No edition found${month ? ` for ${month}` : ''}.`);
  process.exit(1);
}
let failed = false;
for (const ed of list) {
  const errors = validateEdition(ed, projects);
  const status = errors.length ? 'FAIL' : 'OK';
  console.log(`${status} ${ed.month} (${ed.status}, ${ed.rows.length} rows)`);
  for (const e of errors) console.log(`  - ${e}`);
  if (ed.status === 'published' && !errors.length && !isEditionIndexable(ed, projects))
    console.log(`  ! valid but below ${MIN_PROJECTS_FOR_PUBLICATION} projects: will render with noindex and stay out of the sitemap.`);
  if (errors.length) failed = true;
}
process.exit(failed ? 1 : 0);
