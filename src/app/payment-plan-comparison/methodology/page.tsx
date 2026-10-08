import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { DATA_LICENSE_URL, METHODOLOGY_VERSION, MIN_AREA_SAMPLE, MIN_PROJECTS_FOR_PUBLICATION } from '@/lib/payment-plan-report';

const BASE = '/payment-plan-comparison/';

export const metadata: Metadata = {
  title: 'Payment Plan Comparison Methodology',
  description: 'How DubaiOffPlanApartments.com collects, checks and compares Dubai off-plan payment plans each month.',
  alternates: { canonical: `${BASE}methodology/` },
};

export default function Methodology() {
  return (
    <div className="container page article narrow">
      <Breadcrumbs items={[{ name: 'Payment plan comparison', href: BASE }, { name: 'Methodology', href: `${BASE}methodology/` }]} />
      <h1 className="h-page">Payment plan comparison methodology</h1>
      <p className="lead">Version {METHODOLOGY_VERSION}. This page explains what each monthly comparison measures, where the figures come from and how they are calculated.</p>

      <h2 className="h-sub">What we measure</h2>
      <p>For each project we record the share of the purchase price paid at four stages, which together add up to 100%:</p>
      <ul>
        <li><strong>Down payment:</strong> the booking amount plus any further payment due at signing.</li>
        <li><strong>During construction:</strong> instalments due before handover.</li>
        <li><strong>On handover:</strong> the payment due when the keys are handed over.</li>
        <li><strong>After handover:</strong> instalments due after handover, with the length of that period in months.</li>
      </ul>

      <h2 className="h-sub">Sources</h2>
      <p>Figures come only from the developer&apos;s official website, brochure or payment-plan document. We do not use listing portals or advertisements. Every row shows its source and the date it was checked, and a second person reviews each row before an edition is published.</p>

      <h2 className="h-sub">Which projects are included</h2>
      <p>Only projects whose details we have verified are included. An edition is published once at least {MIN_PROJECTS_FOR_PUBLICATION} projects have been checked for that month.</p>

      <h2 className="h-sub">How figures are calculated</h2>
      <p>Area figures are medians (the middle value), which are less affected by a single unusual project than averages. An area needs at least {MIN_AREA_SAMPLE} projects for a median; otherwise only counts are shown. The post-handover period median is calculated only over projects that have post-handover payments.</p>

      <h2 className="h-sub">Month-over-month changes</h2>
      <p>Each edition is compared with the previous one. A change is labelled <em>Lower initial payment</em> when the down payment share falls, and <em>More paid after handover</em> when the post-handover share or period increases. Other changes are listed without a label; we do not judge whether a change is better or worse for a particular buyer.</p>

      <h2 className="h-sub">Limits</h2>
      <p>Developers can change terms at any time, and terms can differ by unit, floor or launch phase. The comparison describes the terms published at the time of checking and is not financial advice.</p>

      <h2 className="h-sub">Corrections and reuse</h2>
      <p>If we find an error after publication, we correct the edition and list the correction with its date on that page. The data is licensed under <a href={DATA_LICENSE_URL} target="_blank" rel="noopener license">CC BY 4.0</a>: you may reuse it with credit to DubaiOffPlanApartments.com and a link to the edition.</p>

      <h2 className="h-sub">Version history</h2>
      <table className="data-table"><thead><tr><th>Version</th><th>Date</th><th>Change</th></tr></thead>
        <tbody><tr><td>1.0</td><td>8 October 2026</td><td>First version.</td></tr></tbody>
      </table>
      <p style={{ marginTop: 20 }}><Link href={BASE} className="link-dark">Back to the payment plan comparison</Link></p>
    </div>
  );
}
