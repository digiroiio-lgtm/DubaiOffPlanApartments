import { DemoBadge } from './ProjectCard';

export const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
export const months = (v: number | null) => (v === null ? '—' : `${v} months`);

/** Repeated under every section of a demo edition so no screenshot of a table loses the warning. */
export function DemoStrip({ show }: { show: boolean }) {
  if (!show) return null;
  return <p className="demo-strip"><DemoBadge /> Demo data: not market data. These figures are placeholders built from fictional projects.</p>;
}
