// End-to-end checks against a running server: node tests/e2e.mjs [baseUrl]
// Requires ADMIN_USERNAME/ADMIN_PASSWORD to match the server (defaults to .env.local preview values).
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const BASE = process.argv[2] || 'http://localhost:3000';
const AUTH = 'Basic ' + Buffer.from(`${process.env.ADMIN_USERNAME || 'admin'}:${process.env.ADMIN_PASSWORD || 'preview-only-password'}`).toString('base64');
const results = [];
async function check(name, fn) {
  try { await fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', name, e.message]); }
}
const ip = () => `203.0.113.${Math.floor(Math.random() * 250)}`;
const lead = (o = {}) => ({
  budget: '1m-1.5m', deposit: '200k-400k', timeline: '3-6-months', area: 'jvc', unitType: '1br', purpose: 'investment',
  name: 'Test Buyer', phoneCountry: 'AE', phone: `5${Math.floor(10000000 + Math.random() * 89999999)}`, consent: true,
  sourcePage: '/', ...o,
});
const post = (body, headers = {}) => fetch(`${BASE}/api/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip(), ...headers }, body: JSON.stringify(body) });
async function token() { const t = (await (await fetch(`${BASE}/api/form-token`)).json()).token; await new Promise((r) => setTimeout(r, 3100)); return t; }

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

await check('Home form: step 1 -> step 2 -> stored lead -> success message + lead_submitted event (no PII)', async () => {
  const page = await browser.newPage({ viewport: { width: 1019, height: 900 } });
  await page.goto(`${BASE}/?utm_source=e2e&utm_campaign=launch`);
  await page.click('.hero .btn-lg'); // CTA
  await page.selectOption('#lf-budget', '1m-1.5m');
  await page.selectOption('#lf-deposit', '200k-400k');
  await page.selectOption('#lf-timeline', '1-3-months');
  const phone = `50 ${Math.floor(100 + Math.random() * 899)} ${Math.floor(1000 + Math.random() * 8999)}`;
  await page.fill('#lf-phone', phone);
  await page.click('.lf-next');
  assert.ok(await page.isVisible('#lf-budget'), 'must stay on step 1 without consent');
  assert.ok(await page.isVisible('text=Please confirm that a partner advisor may contact you.'));
  await page.check('#lf-consent-hero');
  await page.click('.lf-next');
  await page.waitForSelector('#lf-name', { state: 'visible' });
  assert.ok(await page.isVisible('.lf-consent-detail'), 'full consent text visible before submit');
  await page.fill('#lf-name', 'Ayşe Browser');
  await page.selectOption('#lf-area', 'business-bay');
  await page.selectOption('#lf-unitType', '2br');
  await page.selectOption('#lf-purpose', 'own-use');
  await page.waitForTimeout(3100); // minimum fill time
  await page.click('.lf-submit');
  await page.waitForSelector('.lf-done', { timeout: 10000 });
  const text = await page.textContent('.lf-done');
  assert.match(text, /Your request has been received/);
  assert.doesNotMatch(text, /3 (matched )?projects are ready/i);
  const ref = (await page.textContent('.lf-ref strong')).trim();
  assert.match(ref, /^DOP-\d{8}-[0-9A-F]{8}$/);
  const dl = await page.evaluate(() => window.dataLayer);
  const events = dl.map((e) => e.event);
  for (const ev of ['cta_click', 'form_start', 'form_step_complete', 'lead_submitted']) assert.ok(events.includes(ev), `missing ${ev}`);
  const raw = JSON.stringify(dl);
  const digits = phone.replace(/\D/g, '');
  assert.ok(!raw.includes('Ayşe') && !raw.includes(digits.slice(-7)), 'PII leaked into dataLayer');
  assert.ok(!page.url().includes(digits.slice(-7)), 'PII in URL');
  // Stored record visible in protected admin
  const ctx = await browser.newContext({ extraHTTPHeaders: { Authorization: AUTH } });
  const admin = await ctx.newPage();
  await admin.goto(`${BASE}/admin/leads/${ref}/`);
  const body = await admin.textContent('body');
  assert.match(body, /Ayşe Browser/); assert.ok(body.includes(`+971${digits}`)); assert.match(body, /new/);
  assert.match(body, /e2e \/ launch/); assert.match(body, /version 2026-10-07\.v1/);
  await ctx.close(); await page.close();
});

await check('Failed save never shows success (server 500 simulated)', async () => {
  const page = await browser.newPage({ viewport: { width: 1019, height: 900 } });
  await page.route('**/api/leads', (r) => r.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false,"error":"Sorry, we could not save your request."}' }));
  await page.goto(BASE);
  await page.selectOption('#lf-budget', '750k-1m'); await page.selectOption('#lf-deposit', 'under-100k');
  await page.selectOption('#lf-timeline', 'researching'); await page.fill('#lf-phone', '501112223'); await page.check('#lf-consent-hero');
  await page.click('.lf-next'); await page.fill('#lf-name', 'Fail Case');
  await page.selectOption('#lf-area', 'open'); await page.selectOption('#lf-unitType', 'open'); await page.selectOption('#lf-purpose', 'both');
  await page.click('.lf-submit');
  await page.waitForSelector('.lf-message');
  assert.equal(await page.isVisible('.lf-done'), false);
  const events = (await page.evaluate(() => window.dataLayer)).map((e) => e.event);
  assert.ok(!events.includes('lead_submitted'));
  await page.close();
});

await check('No-JS fallback: plain form post stores lead and redirects to reference page', async () => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1019, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE);
  assert.ok(await page.isVisible('#lf-name'), 'all fields visible without JS');
  await page.selectOption('#lf-budget', '2m-3m'); await page.selectOption('#lf-deposit', '400k-750k');
  await page.selectOption('#lf-timeline', 'within-1-month'); await page.fill('#lf-phone', `79${Math.floor(10000000 + Math.random() * 89999999)}`); await page.selectOption('select[name=phoneCountry]', 'GB');
  await page.fill('#lf-name', 'No Script'); await page.selectOption('#lf-area', 'dubai-south'); await page.selectOption('#lf-unitType', '3br'); await page.selectOption('#lf-purpose', 'investment');
  await page.check('#lf-consent-hero');
  await Promise.all([page.waitForURL(/request-received/), page.click('.lf-submit')]);
  assert.match(page.url(), /ref=DOP-/); assert.match(await page.textContent('h1'), /received/);
  await ctx.close();
});

await check('API: missing consent -> 422, nothing stored', async () => {
  const r = await post(lead({ consent: false })); assert.equal(r.status, 422);
  assert.ok((await r.json()).errors.consent);
});
await check('API: honeypot filled -> rejected', async () => {
  const r = await post(lead({ company_website: 'http://spam' })); assert.equal(r.status, 400);
});
await check('API: submitted too fast (fresh token) -> 429', async () => {
  const t = (await (await fetch(`${BASE}/api/form-token`)).json()).token;
  const r = await post(lead({ formToken: t })); assert.equal(r.status, 429);
});
await check('API: forged token -> 429', async () => {
  const r = await post(lead({ formToken: `${Date.now() - 10000}.forged` })); assert.equal(r.status, 429);
});
await check('API: cross-origin post -> 403', async () => {
  const r = await post(lead(), { Origin: 'https://evil.example' }); assert.equal(r.status, 403);
});
await check('API: valid -> 201 new; same submissionId -> same lead; same phone in 24h -> duplicate', async () => {
  const t = await token();
  const body = lead({ formToken: t, submissionId: `sub-${Date.now()}` });
  const a = await post(body); assert.equal(a.status, 201); const ja = await a.json();
  const b = await post(body); assert.equal(b.status, 200); const jb = await b.json();
  assert.equal(jb.leadId, ja.leadId); assert.equal(jb.duplicate, true);
  const c = await post({ ...body, submissionId: `other-${Date.now()}` }); const jc = await c.json();
  assert.equal(jc.leadId, ja.leadId); assert.equal(jc.duplicate, true);
});
await check('API: rate limit after 5 attempts per IP per hour', async () => {
  const fixed = '198.51.100.7'; let last;
  for (let i = 0; i < 6; i++) last = await post(lead({ consent: true }), { 'x-forwarded-for': fixed });
  assert.equal(last.status, 429);
});

await check('Admin: requires auth; qualified blocked until checklist complete', async () => {
  assert.equal((await fetch(`${BASE}/admin/leads/`)).status, 401);
  assert.equal((await fetch(`${BASE}/admin/leads/`, { headers: { Authorization: 'Basic ' + Buffer.from('admin:wrong').toString('base64') } })).status, 401);
  const t = await token();
  const { leadId } = await (await post(lead({ formToken: t }))).json();
  const upd = (body) => fetch(`${BASE}/api/admin/leads/${leadId}/`, { method: 'POST', headers: { Authorization: AUTH, 'Content-Type': 'application/json', Origin: BASE }, body: JSON.stringify(body) });
  const partial = { contactVerified: true, budgetFit: true, timelineReviewed: true, preferencesReviewed: true, sharingConsentConfirmed: false };
  let r = await upd({ status: 'qualified', review: partial, notes: '' }); assert.equal(r.status, 422);
  r = await upd({ status: 'qualified', review: { ...partial, sharingConsentConfirmed: true }, notes: 'Called, confirmed.' }); assert.equal(r.status, 200);
  r = await upd({ status: 'routed', review: { ...partial, sharingConsentConfirmed: true }, notes: '' }); assert.equal(r.status, 422, 'routed needs partner name');
  const list = await (await fetch(`${BASE}/admin/leads/?status=qualified`, { headers: { Authorization: AUTH } })).text();
  assert.ok(list.includes(leadId));
  r = await fetch(`${BASE}/api/admin/leads/${leadId}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: BASE }, body: '{}' });
  assert.equal(r.status, 401);
});

await check('Projects filters: area + budget + plan, missing prices reported not zeroed', async () => {
  const page = await browser.newPage();
  await page.goto(`${BASE}/projects/?area=business-bay&budget=2000000`);
  const count = await page.textContent('.result-count');
  assert.match(count, /2 projects found/); assert.match(count, /1 without a published price/);
  assert.equal(await page.getAttribute('meta[name=robots]', 'content'), 'noindex, follow');
  await page.goto(`${BASE}/projects/?plan=post-handover`);
  assert.match(await page.textContent('.result-count'), /5 projects found/);
  await page.goto(`${BASE}/projects/demo-project-08/`);
  assert.match(await page.textContent('.facts-table'), /Starting priceNot published/);
  assert.ok(!(await page.textContent('body')).includes('AED 0'));
  await page.close();
});

await check('Compare: add 2 via buttons, compare page renders and fires compare_used', async () => {
  const page = await browser.newPage();
  await page.goto(`${BASE}/projects/`);
  const btns = page.locator('.compare-toggle'); await btns.nth(0).click(); await btns.nth(4).click();
  await page.click('.compare-bar .btn');
  await page.waitForURL(/compare\/\?p=/);
  await page.waitForSelector('.compare-table');
  assert.equal(await page.locator('.compare-table thead th').count(), 3);
  const events = (await page.evaluate(() => window.dataLayer)).map((e) => e.event);
  assert.ok(events.includes('compare_used'));
  await page.goto(`${BASE}/compare/?p=demo-project-01,demo-project-02,demo-project-03,demo-project-04`);
  assert.equal(await page.locator('.compare-table thead th').count(), 4, 'max 3 projects + label column');
  await page.close();
});

await check('SEO: demo projects noindex and absent from sitemap; canonical + robots present', async () => {
  const html = await (await fetch(`${BASE}/projects/demo-project-01/`)).text();
  assert.match(html, /<meta name="robots" content="noindex, follow"/);
  assert.match(html, /Demo data/);
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  assert.ok(!sm.includes('demo-project')); assert.ok(sm.includes('/guides/total-purchase-costs/')); assert.ok(!sm.includes('/projects/budget/'));
  const home = await (await fetch(`${BASE}/`)).text();
  assert.match(home, /<link rel="canonical" href="[^"]+\/"/);
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  assert.match(robots, /Disallow: \/admin\//);
  const guide = await (await fetch(`${BASE}/guides/total-purchase-costs/`)).text();
  assert.match(guide, /Last updated/); assert.match(guide, /BreadcrumbList/);
});

await check('SEO band 1: home H1/title, Organization schema, footer links, canonical rules', async () => {
  const home = await (await fetch(`${BASE}/`)).text();
  const h1s = [...home.matchAll(/<h1[^>]*>(.*?)<\/h1>/g)].map((m) => m[1]);
  assert.equal(h1s.length, 1, 'exactly one H1');
  assert.match(h1s[0], /Dubai off-plan apartments/i);
  const title = home.match(/<title>(.*?)<\/title>/)[1].replace(/&amp;/g, '&');
  assert.equal(title, 'Dubai Off-Plan Apartments: Compare Projects & Payment Plans');
  assert.ok(title.length <= 60, `title ${title.length} chars`);
  const ld = [...home.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const graph = ld.flatMap((x) => x['@graph'] || [x]);
  const org = graph.find((x) => x['@type'] === 'Organization');
  assert.ok(org && org.logo && org.url, 'Organization with logo');
  assert.ok(graph.some((x) => x['@type'] === 'WebSite'));
  assert.ok(!JSON.stringify(ld).includes('aggregateRating'));
  assert.equal((await fetch(`${BASE}/logo-512.png`)).status, 200);
  for (const href of ['/areas/jvc/', '/areas/dubai-maritime-city/', '/guides/', '/projects/', '/terms/', '/privacy/', '/contact/'])
    assert.ok(home.includes(`href="${href}"`), `footer/site link ${href}`);
  // Filtered list: self-canonical (normalised order) + noindex, never canonical elsewhere.
  const f = await (await fetch(`${BASE}/projects/?budget=2000000&area=jvc`)).text();
  assert.match(f, /<link rel="canonical" href="[^"]*\/projects\/\?area=jvc&amp;budget=2000000"/);
  assert.match(f, /<meta name="robots" content="noindex, follow"/);
  const c = await (await fetch(`${BASE}/compare/`)).text();
  assert.match(c, /<meta name="robots" content="noindex, follow"/);
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  assert.ok(!sm.includes('/compare/'));
});

await check('Payment plan comparison: demo edition labelled, noindex, CSV, hub, methodology, sitemap', async () => {
  const page = await browser.newPage({ viewport: { width: 1019, height: 900 } });
  await page.goto(`${BASE}/payment-plan-comparison/2026-10/`);
  assert.match(await page.textContent('h1'), /Payment Plan Comparison: October 2026/);
  assert.equal(await page.getAttribute('meta[name=robots]', 'content'), 'noindex, follow');
  const strips = await page.locator('.demo-strip').count();
  assert.ok(strips >= 4, `demo warning under every section (${strips})`);
  const findings = await page.locator('.findings li').allTextContents();
  assert.match(findings[0], /^We tracked 18 projects in October 2026; (\d+ of them offers?|none of them offer) post-handover instalments\.$/);
  assert.ok(findings.some((f) => /3 projects changed their payment terms since September 2026; 1 now asks for a lower initial payment\./.test(f)));
  const changes = await page.textContent('.changes');
  assert.match(changes, /Demo Project 02 · JVC: Down payment 20% → 10%/);
  assert.match(changes, /No longer tracked/);
  assert.match(changes, /Newly tracked this month/);
  assert.equal(await page.locator('script[type="application/ld+json"]').filter({ hasText: 'Dataset' }).count(), 0, 'no Dataset schema for demo data');
  // Keep the page (and its dataLayer) instead of navigating to the CSV.
  await page.evaluate(() => document.querySelector('a[data-report-month="2026-10"]').addEventListener('click', (e) => e.preventDefault()));
  await page.click('a[data-report-month="2026-10"]');
  const events = (await page.evaluate(() => window.dataLayer)).map((e) => e.event);
  assert.ok(events.includes('report_download'));
  await page.close();
  const csv = await fetch(`${BASE}/payment-plan-comparison/2026-10/data.csv`);
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /^text\/csv/);
  assert.equal(csv.headers.get('x-robots-tag'), 'noindex');
  const body = await csv.text();
  assert.ok(body.startsWith('month,project,project_slug,area,down_payment_pct,construction_pct,on_handover_pct,post_handover_pct,post_handover_months,source_label,source_url,checked_at,edition_status\n'));
  assert.equal(body.trim().split('\n').length, 19);
  const hub = await (await fetch(`${BASE}/payment-plan-comparison/`)).text();
  assert.ok(hub.includes('href="/payment-plan-comparison/methodology/"'));
  assert.match(hub, /<meta name="robots" content="noindex, follow"/);
  const m = await fetch(`${BASE}/payment-plan-comparison/methodology/`);
  assert.equal(m.status, 200);
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  assert.ok(sm.includes('/payment-plan-comparison/methodology/'));
  assert.ok(!sm.includes('/payment-plan-comparison/2026-'));
  const m390 = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  for (const u of ['/payment-plan-comparison/', '/payment-plan-comparison/2026-10/', '/payment-plan-comparison/methodology/']) {
    await m390.goto(`${BASE}${u}`);
    assert.equal(await m390.evaluate(() => window.innerWidth), 390, `no overflow on ${u}`);
  }
  await m390.close();
});

await check('Mobile 390px: CTA scrolls to the form; no horizontal overflow', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(BASE);
  await page.click('.hero .btn-lg');
  await page.waitForTimeout(2000);
  const top = await page.evaluate(() => document.getElementById('match-form').getBoundingClientRect().top);
  assert.ok(top >= 0 && top < 120, `form top after scroll: ${top}`);
  const overflow = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, window.innerWidth) - 390);
  assert.equal(overflow, 0);
  await page.close();
});

await browser.close();
for (const r of results) console.log(r.join(' — '));
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
