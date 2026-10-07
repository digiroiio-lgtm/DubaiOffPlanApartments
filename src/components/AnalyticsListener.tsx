'use client';
import { useEffect } from 'react';
import { captureUtm, track } from '@/lib/analytics';

/** Captures UTM parameters, tracks [data-cta] clicks and handles "scroll to form" CTAs. */
export default function AnalyticsListener() {
  useEffect(() => {
    captureUtm();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cta]');
      if (!el) return;
      track('cta_click', { cta: el.dataset.cta, location: el.dataset.ctaLocation || window.location.pathname });
      const href = el.getAttribute('href') || '';
      if (href.endsWith('#match-form')) {
        const form = document.getElementById('match-form');
        if (form) {
          e.preventDefault();
          form.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.setTimeout(() => form.querySelector<HTMLElement>('select, input')?.focus({ preventScroll: true }), 700);
        }
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
