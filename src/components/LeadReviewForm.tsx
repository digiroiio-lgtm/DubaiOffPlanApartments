'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LeadReviewForm(props: {
  id: string; status: string; review: Record<string, boolean>; notes: string; routedTo: string;
  statuses: string[]; items: Record<string, string>;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="lead-card review-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const fd = new FormData(e.currentTarget);
        const review = Object.fromEntries(Object.keys(props.items).map((k) => [k, fd.get(k) === 'on']));
        const res = await fetch(`/api/admin/leads/${props.id}/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: fd.get('status'), notes: fd.get('notes'), routedTo: fd.get('routedTo'), review }),
        });
        const j = await res.json().catch(() => ({}));
        setBusy(false);
        setMsg(res.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: j.error || 'Could not save.' });
        if (res.ok) router.refresh();
      }}
    >
      <h2 className="lf-title">Review</h2>
      <fieldset>
        <legend className="lf-sub">Required before <code>qualified</code> / <code>routed</code></legend>
        {Object.entries(props.items).map(([k, label]) => (
          <label key={k} className="lf-consent"><input type="checkbox" name={k} defaultChecked={!!props.review[k]} /> {label}</label>
        ))}
      </fieldset>
      <div className="lf-field"><label htmlFor="rv-status">Status</label>
        <div className="lf-select"><select id="rv-status" name="status" defaultValue={props.status}>{props.statuses.map((s) => <option key={s}>{s}</option>)}</select></div>
      </div>
      <div className="lf-field"><label htmlFor="rv-routed">Routed to partner (manual)</label><input id="rv-routed" type="text" name="routedTo" defaultValue={props.routedTo} /></div>
      <div className="lf-field"><label htmlFor="rv-notes">Notes</label><textarea id="rv-notes" name="notes" rows={5} defaultValue={props.notes} /></div>
      <button className="btn btn-green" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      {msg && <p className={msg.ok ? 'ok-msg' : 'lf-error'} role="status">{msg.text}</p>}
    </form>
  );
}
