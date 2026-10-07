'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { track } from '@/lib/analytics';

const KEY = 'dop_compare';
export const MAX_COMPARE = 3;

export function readCompare(): string[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter((s) => typeof s === 'string').slice(0, MAX_COMPARE) : []; } catch { return []; }
}
export function writeCompare(list: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_COMPARE))); } catch { /* ignore */ }
  window.dispatchEvent(new Event('dop-compare'));
}

function useCompare() {
  const [list, setList] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setList(readCompare());
    sync();
    window.addEventListener('dop-compare', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('dop-compare', sync); window.removeEventListener('storage', sync); };
  }, []);
  return list;
}

export default function CompareToggle({ slug }: { slug: string }) {
  const list = useCompare();
  const active = list.includes(slug);
  const full = !active && list.length >= MAX_COMPARE;
  return (
    <button
      type="button"
      className={`compare-toggle${active ? ' is-active' : ''}`}
      aria-pressed={active}
      disabled={full}
      title={full ? 'You can compare up to 3 projects' : undefined}
      onClick={() => {
        const next = active ? list.filter((s) => s !== slug) : [...list, slug];
        writeCompare(next);
        if (!active) track('compare_add', { count: next.length });
      }}
    >
      {active ? '✓ Added to compare' : full ? 'Compare full (3)' : '+ Compare'}
    </button>
  );
}

export function CompareBar() {
  const list = useCompare();
  if (!list.length) return null;
  return (
    <div className="compare-bar" role="region" aria-label="Compare selection">
      <span>{list.length} of {MAX_COMPARE} selected</span>
      <Link className="btn btn-green" href={`/compare/?p=${list.join(',')}`}>Compare now</Link>
      <button type="button" className="lf-back" onClick={() => writeCompare([])}>Clear</button>
    </div>
  );
}
