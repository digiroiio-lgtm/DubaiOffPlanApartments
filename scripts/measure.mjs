// Prints bounding boxes of key home page elements at a given viewport width.
import { chromium } from 'playwright-core';
const [url = 'http://localhost:3000/', width = '1019'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const sel = ['.brand-name', '.brand svg', '.main-nav', '.btn-advisor', '.hero', '.hero .eyebrow', '.hero h1', '.hero-sub', '.hero .btn-lg', '.link-light', '.lead-card', '.lf-title', '.lf-sub', '#lf-budget', '#lf-deposit', '#lf-timeline', '.lf-cc', '#lf-phone', '.lf-next', '.lf-consent', '.lf-foot', '.benefits', '.benefit h2', '.areas-home', '.areas-home .h-section', '.areas-home .section-sub', '.area-card', '.area-body h3', '.compare-home', '.compare-panel', '.compare-left .h-section', '.compare-preview', '.step-num', '.steps h3', '.cta-band', '.cta-band h2', '.btn-cta', '.site-footer', '.footer-links'];
for (const s of sel) {
  const r = await page.evaluate((s) => { const els=[...document.querySelectorAll(s)]; return els.map(e=>{const b=e.getBoundingClientRect(); return `${Math.round(b.x)},${Math.round(b.y+scrollY)} ${Math.round(b.width)}x${Math.round(b.height)}`}).join(' | ') }, s);
  console.log(s.padEnd(28), r);
}
await browser.close();
