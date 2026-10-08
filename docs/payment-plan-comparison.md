# Monthly Payment Plan Comparison — editorial workflow

The comparison is published at `/payment-plan-comparison/`. Each monthly edition lists the payment terms of verified projects, checked against the developer's official documents. It is called a **comparison**, not an index: the name "index" would need a fixed, versioned calculation (weights, base period) that we have not defined.

## Rules

- Sources: the developer's own website, brochure or payment-plan PDF only. Never portals, ads or broker messages.
- Only projects with `status: 'verified'` in `src/content/projects.ts` can appear in a published edition.
- The four shares (down payment, during construction, on handover, after handover) must add up to 100%.
- A post-handover share needs its period in months; no share means `postHandoverMonths: null`.
- Never estimate a missing value. If a developer does not publish the terms, leave the project out that month.
- An edition is indexed only with ≥ 20 projects (`MIN_PROJECTS_FOR_PUBLICATION`). Below that it still renders but stays `noindex` and out of the sitemap.
- Data licence: CC BY 4.0.

## Monthly steps

1. **Freeze the list** (1st working day): copy last month's project list into a new edition in `src/content/payment-plan-snapshots.ts` with `status: 'draft'` and the new `month`.
2. **Check every project**: open the official source, enter the four shares, the post-handover months, `sourceUrl`, `sourceLabel`, `checkedAt` (today) and your initials in `checkedBy`.
3. **Second check**: another person opens each source and confirms the row.
4. **Validate**: `npm run report:check -- YYYY-MM` must print `OK`.
5. **Publish**: set `status: 'published'` and `publishedAt`, run `npm test` and `npm run build`, deploy.
6. **Corrections**: if an error is found later, fix the row and add `{ date, text }` to the edition's `corrections`. Never silently change a published figure.

## What the pages compute (src/lib/payment-plan-report.ts)

- Medians per area; an area needs ≥ 3 projects for medians (`MIN_AREA_SAMPLE`).
- Month-over-month changes against the previous edition. Labels: *Lower initial payment* (down payment share fell) and *More paid after handover* (post-handover share or period increased). Other changes are listed without a label.
- Headline sentences are templates filled only with computed numbers.
- CSV at `/payment-plan-comparison/YYYY-MM/data.csv`.
- Article + Dataset structured data only for indexable (published, valid, ≥ 20 rows) editions.

## Demo editions

`2026-09` and `2026-10` are fictional demo editions built from the demo projects. They render only with `SHOW_DEMO_CONTENT=true`, carry a "Demo data" warning under every section, are `noindex`, and are excluded from the sitemap and structured data. Remove them (or set `SHOW_DEMO_CONTENT=false`) once real editions exist.
