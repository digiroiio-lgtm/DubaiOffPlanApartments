// Usage: node scripts/screenshot.mjs <url> <width> <out.png> [height]
import { chromium } from 'playwright-core';
const [url, width, out, height] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height || 900) }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: !height });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
console.log('height', h);
await browser.close();
