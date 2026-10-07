import Link from 'next/link';
import { notFound } from 'next/navigation';
import LeadReviewForm from '@/components/LeadReviewForm';
import { AREA_OPTIONS, BUDGET_OPTIONS, DEPOSIT_OPTIONS, labelFor, PURPOSE_OPTIONS, TIMELINE_OPTIONS, UNIT_OPTIONS } from '@/lib/leads/options';
import { getLead, LEAD_STATUSES, REVIEW_ITEMS } from '@/lib/leads/store';

export const dynamic = 'force-dynamic';

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const data = getLead((await params).id);
  if (!data) notFound();
  const { lead: l, events } = data;
  const rows: [string, string][] = [
    ['Status', l.status], ['Received', l.created_at], ['Name', l.name], ['WhatsApp', l.phone_e164],
    ['Total budget', labelFor(BUDGET_OPTIONS, l.budget)], ['Initial payment', labelFor(DEPOSIT_OPTIONS, l.deposit)],
    ['Timeline', labelFor(TIMELINE_OPTIONS, l.timeline)], ['Area', labelFor(AREA_OPTIONS, l.area)],
    ['Apartment type', labelFor(UNIT_OPTIONS, l.unit_type)], ['Purpose', labelFor(PURPOSE_OPTIONS, l.purpose)],
    ['Source page', l.source_page],
    ['UTM', [l.utm_source, l.utm_medium, l.utm_campaign, l.utm_term, l.utm_content].filter(Boolean).join(' / ') || '—'],
    ['Consent', `${l.consent_given ? 'Given' : 'No'} · version ${l.consent_version} · ${l.consent_at}`],
    ['Routed to', l.routed_to ?? '—'],
  ];
  return (
    <>
      <p><Link className="link-dark" href="/admin/leads/">← All leads</Link></p>
      <h1 className="h-page">{l.id}</h1>
      <div className="detail-layout">
        <div>
          <dl className="facts-table">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <h2 className="h-sub">Consent text stored</h2>
          <blockquote>{l.consent_text}</blockquote>
          <h2 className="h-sub">History</h2>
          <ul>{events.map((e, i) => <li key={i}>{e.at} · {e.type}{e.to_status ? ` · ${e.from_status ?? '—'} → ${e.to_status}` : ''}</li>)}</ul>
        </div>
        <aside>
          <LeadReviewForm id={l.id} status={l.status} review={JSON.parse(l.review || '{}')} notes={l.notes} routedTo={l.routed_to ?? ''} statuses={[...LEAD_STATUSES]} items={REVIEW_ITEMS} />
        </aside>
      </div>
    </>
  );
}
