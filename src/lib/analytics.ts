'use client';

/**
 * Minimal analytics layer. Events go to window.dataLayer (GTM-compatible) and to gtag when
 * NEXT_PUBLIC_GA4_ID is configured. Never pass personal data (name, phone, free text) here.
 */
export type AnalyticsEvent =
  | 'cta_click'
  | 'form_start'
  | 'form_step_complete'
  | 'lead_submitted'
  | 'compare_add'
  | 'compare_used'
  | 'report_download';

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const ALLOWED_KEYS = new Set(['cta', 'location', 'step', 'form_location', 'projects', 'count', 'duplicate', 'page', 'month']);

export function track(event: AnalyticsEvent, props: Props = {}) {
  if (typeof window === 'undefined') return;
  const clean: Props = {};
  for (const [k, v] of Object.entries(props)) if (ALLOWED_KEYS.has(k) && v !== undefined) clean[k] = v;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...clean });
  if (typeof window.gtag === 'function') window.gtag('event', event, clean);
  if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', event, clean);
}

const UTM_STORE = 'dop_utm';
export function captureUtm() {
  try {
    const p = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const v = p.get(k);
      if (v) utm[k] = v.slice(0, 100);
    }
    if (Object.keys(utm).length) sessionStorage.setItem(UTM_STORE, JSON.stringify(utm));
  } catch { /* storage unavailable */ }
}
export function readUtm(): Record<string, string> {
  try { return JSON.parse(sessionStorage.getItem(UTM_STORE) || '{}'); } catch { return {}; }
}
