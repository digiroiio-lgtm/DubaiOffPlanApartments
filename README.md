# DubaiOffPlanApartments.com — Phase 1

Project discovery and buyer-lead platform for Dubai off-plan apartments. Next.js 15 (App Router), SQLite lead store (`node:sqlite`, Node ≥ 22.13), no external services required for the preview.

## Run locally

```bash
npm install
cp .env.example .env.local   # set LEADS_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD (≥12 chars)
npm run build && npm start   # http://localhost:3000
npm test                     # unit tests (lead validation)
npm run test:e2e             # end-to-end checks against the running server (use a fresh DB)
```

## Pages

`/` · `/projects/` (filters: area, total budget, bedrooms, handover, payment plan) · `/projects/[slug]/` · `/projects/budget/[cluster]/` · `/projects/payment-plan/[cluster]/` · `/areas/` + 5 guides · `/guides/` + 5 guides · `/compare/` (max 3) · `/contact/` · `/privacy/` · `/terms/` · `/request-received/` (no-JS fallback) · `/admin/leads/` (basic auth, noindex).

## Content

All data lives in `src/content/` (`projects.ts`, `areas.ts`, `guides.ts`).

| | Count | Public | Indexed |
|---|---|---|---|
| Verified projects | 0 | yes | yes |
| Draft projects | 0 | no | no |
| Demo projects (fictional, labelled "Demo data") | 20 | only when `SHOW_DEMO_CONTENT=true` | never (noindex, not in sitemap) |
| Area guides | 5 | yes | yes |
| Buying guides | 5 | yes | yes |

Budget / payment-plan clusters are generated from project data and only become indexable with ≥ 3 verified projects.
Unknown values render as "Not published", never as 0.

## Lead flow

Two-step form (works without JS: all fields shown, plain POST). Server validation (`src/lib/leads/validate.ts`), honeypot, signed minimum-fill-time token, per-IP rate limit, idempotent `submissionId`, 24h duplicate-phone guard, origin check. Each lead stores: unique ID (`DOP-YYYYMMDD-XXXXXXXX`), timestamps, source path (no query string), allow-listed UTM fields, consent flag + consent text + version (`2026-10-07.v1`) + time. Status starts as `new`; `qualified`/`routed` require the 5-item review checklist (server-enforced). No automatic broker delivery.

Analytics: `cta_click`, `form_start`, `form_step_complete`, `lead_submitted` (only after the server confirms the record), `compare_add`, `compare_used` → `window.dataLayer`, plus GA4 when `NEXT_PUBLIC_GA4_ID` is set. No personal data in events or URLs.

## Design

The home page follows the 1019 × 1543 reference (section boundaries match to the pixel at 1019 px). See `docs/screenshots/`.
Photos are **cropped from the reference mockup** (`scripts/extract-reference-photos.py`) because the original photo files were not supplied; they are low resolution and the hero has a filled/duplicated area behind the form. Replace with original or licensed photos before launch.

## Missing before go-live

- Verified project data (partner feed or developer sources) — currently 0 verified.
- Persistent production database: SQLite needs a persistent disk (VPS/container). Serverless hosts (e.g. Vercel) need a hosted DB adapter.
- `NEXT_PUBLIC_ADVISOR_WHATSAPP` (advisor button falls back to /contact/), `NEXT_PUBLIC_GA4_ID`, production `LEADS_SECRET`, admin credentials, `NEXT_PUBLIC_SITE_URL`.
- Broker/partner integration (leads are kept for manual review and routing).
- Legal review of Privacy Policy / Terms (operator name and contact details), editorial review of guides.
- Original high-resolution photography.
- Rate limiting trusts the first `X-Forwarded-For` value; deploy behind a proxy that sets it.
