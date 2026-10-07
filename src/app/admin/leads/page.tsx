import Link from 'next/link';
import { AREA_OPTIONS, BUDGET_OPTIONS, DEPOSIT_OPTIONS, labelFor, TIMELINE_OPTIONS } from '@/lib/leads/options';
import { countByStatus, LEAD_STATUSES, listLeads } from '@/lib/leads/store';

export const dynamic = 'force-dynamic';
type SP = Promise<Record<string, string | undefined>>;

export default async function LeadsAdmin({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const f = { status: sp.status, area: sp.area, budget: sp.budget, q: sp.q?.slice(0, 50) };
  const leads = listLeads(f);
  const counts = countByStatus();
  return (
    <>
      <h1 className="h-page">Leads</h1>
      <p className="muted">Internal list. New submissions start as <code>new</code>; mark <code>qualified</code> only after the review checklist is complete. No automatic broker delivery is configured.</p>
      <p className="status-counts">{LEAD_STATUSES.map((s) => <span key={s}>{s}: <strong>{counts[s] ?? 0}</strong></span>)}</p>
      <form className="filters" method="get">
        <label>Status<select name="status" defaultValue={f.status ?? ''}><option value="">All</option>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
        <label>Area<select name="area" defaultValue={f.area ?? ''}><option value="">All</option>{AREA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label>Budget<select name="budget" defaultValue={f.budget ?? ''}><option value="">All</option>{BUDGET_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
        <label>Search<input name="q" defaultValue={f.q ?? ''} placeholder="ID, name or phone" /></label>
        <div className="filters-actions"><button className="btn btn-green">Filter</button><Link className="link-dark" href="/admin/leads/">Reset</Link></div>
      </form>
      <div className="table-wrap">
        <table className="data-table admin-table">
          <thead><tr><th>Received</th><th>ID</th><th>Status</th><th>Name</th><th>Budget</th><th>Initial</th><th>Timeline</th><th>Area</th><th>Source</th></tr></thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>{l.created_at.slice(0, 16).replace('T', ' ')}</td>
                <td><Link href={`/admin/leads/${l.id}/`}>{l.id}</Link></td>
                <td><span className={`status status-${l.status}`}>{l.status}</span></td>
                <td>{l.name}</td>
                <td>{labelFor(BUDGET_OPTIONS, l.budget)}</td>
                <td>{labelFor(DEPOSIT_OPTIONS, l.deposit)}</td>
                <td>{labelFor(TIMELINE_OPTIONS, l.timeline)}</td>
                <td>{labelFor(AREA_OPTIONS, l.area)}</td>
                <td>{l.source_page}{l.utm_source ? ` · ${l.utm_source}` : ''}</td>
              </tr>
            ))}
            {!leads.length && <tr><td colSpan={9}>No leads match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
