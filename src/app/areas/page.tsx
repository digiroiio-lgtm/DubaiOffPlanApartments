import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Arrow } from '@/components/Icons';
import { areas } from '@/content/areas';

export const metadata: Metadata = {
  title: 'Dubai Area Guides for Off-Plan Apartment Buyers',
  description: 'Guides to JVC, Business Bay, Dubai South, Dubai Creek Harbour and Dubai Maritime City for off-plan apartment buyers.',
  alternates: { canonical: '/areas/' },
};

export default function AreasPage() {
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Areas', href: '/areas/' }]} />
      <h1 className="h-page">Dubai area guides</h1>
      <p className="lead">Start with the location that fits your plans: access, what buyers usually compare and the questions to ask.</p>
      <div className="area-list">
        {areas.map((a) => (
          <article className="area-card" key={a.slug}>
            <Link href={`/areas/${a.slug}/`} className="area-img" tabIndex={-1} aria-hidden="true">
              {a.image ? <Image src={a.image} alt={a.imageAlt} fill sizes="(max-width: 760px) 100vw, 33vw" /> : <span className="img-placeholder">{a.shortName}</span>}
            </Link>
            <div className="area-body">
              <h2 className="area-title"><Link href={`/areas/${a.slug}/`}>{a.name}</Link></h2>
              <p>{a.tagline}</p>
              <Link href={`/areas/${a.slug}/`} className="link-dark">Read the guide <Arrow size={11} /></Link>
            </div>
          </article>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 16 }}>Photos are representative and do not show specific projects.</p>
    </div>
  );
}
