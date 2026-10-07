'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { writeCompare } from './CompareToggle';

export default function CompareTracker({ slugs }: { slugs: string[] }) {
  const key = slugs.join(',');
  useEffect(() => {
    if (slugs.length >= 2) {
      track('compare_used', { count: slugs.length });
      writeCompare(slugs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
