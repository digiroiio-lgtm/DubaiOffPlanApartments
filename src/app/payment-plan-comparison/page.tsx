import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { DemoBadge } from '@/components/ProjectCard';
import { projects } from '@/content/projects';
import { latestIndexableEdition, previousEdition, visibleEditions } from '@/lib/payment-plan-editions';
import { headlineFindings, monthLabel } from '@/lib/payment-plan-report';
import { areaName } from '@/lib/projects';

const BASE = '/payment-plan-comparison/';

export function generateMetadata(): Metadata {
  return {
    title: { absolute: 'Monthly Dubai Off-Plan Payment Plan Comparison' },
    description: 'A monthly comparison of down payment, construction, handover and post-handover terms of Dubai off-plan projects, checked against developer documents.',
    alternates: { canonical: BASE },
    // Indexed once a real edition passes validation and the sample threshold.
    robots: { index: !!latestIndexableEdition(), follow: true },
  };
}

export default function ComparisonHub() {
  const list = visibleEditions();
  const latest = list[0];
  const findings = latest ? headlineFindings(latest, previousEdition(latest), projects, areaName) : [];
  return (
    <div className="container page report">
      <Breadcrumbs items={[{ name: 'Payment plan comparison', href: BASE }]} />
      <h1 className="h-page">Monthly Payment Plan Comparison</h1>
      <p className="lead">Each month we check the payment terms of Dubai off-plan projects against the developers&apos; own documents and compare them side by side: down payment, payments during construction, the handover payment and post-handover instalments.</p>
      {latest ? (
        <section className="edition-card">
          <h2 className="h-sub">
            <Link href={`${BASE}${latest.month}/`}>Latest: {monthLabel(latest.month)}</Link> {latest.status === 'demo' && <DemoBadge />}
          </h2>
          {latest.status === 'demo' && <p className="muted small">Demo data: not market data.</p>}
          <ul className="findings">{findings.slice(0, 3).map((f) => <li key={f}>{f}</li>)}</ul>
          <Link className="link-dark" href={`${BASE}${latest.month}/`}>Read the {monthLabel(latest.month)} comparison</Link>
        </section>
      ) : (
        <p className="notice">The first edition is being prepared. It will be published once enough projects have been verified.</p>
      )}
      {list.length > 1 && (
        <>
          <h2 className="h-sub">Earlier editions</h2>
          <ul>{list.slice(1).map((e) => <li key={e.month}><Link href={`${BASE}${e.month}/`}>{monthLabel(e.month)}</Link>{e.status === 'demo' && <> <DemoBadge /></>}</li>)}</ul>
        </>
      )}
      <h2 className="h-sub">How it works</h2>
      <p>Only projects verified against an official developer source are included, and every figure shows its source and the date it was checked. Read the <Link href={`${BASE}methodology/`}>methodology</Link>.</p>
    </div>
  );
}
