import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { guides } from '@/content/guides';

export const metadata: Metadata = {
  title: 'Buying Guides for Dubai Off-Plan Apartments',
  description: 'How off-plan buying works in Dubai: process, total costs, payment plans, developer checks and off-plan vs ready.',
  alternates: { canonical: '/guides/' },
};

export default function GuidesPage() {
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Buying Guide', href: '/guides/' }]} />
      <h1 className="h-page">Buying guides</h1>
      <p className="lead">Plain-English guides to buying an off-plan apartment in Dubai, with sources and update dates.</p>
      <ul className="guide-list">
        {guides.map((g) => (
          <li key={g.slug}>
            <h2 className="h-sub"><Link href={`/guides/${g.slug}/`}>{g.title}</Link></h2>
            <p className="muted">{g.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
