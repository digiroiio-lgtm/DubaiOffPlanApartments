import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = { title: 'Terms of Use', description: 'Terms of use for DubaiOffPlanApartments.com.', alternates: { canonical: '/terms/' } };

export default function TermsPage() {
  return (
    <div className="container page article narrow">
      <Breadcrumbs items={[{ name: 'Terms', href: '/terms/' }]} />
      <h1 className="h-page">Terms of Use</h1>
      <p className="notice">Draft for review: these terms must be reviewed by a qualified adviser before launch.</p>
      <h2 className="h-sub">About this site</h2>
      <p>DubaiOffPlanApartments.com is an independent project discovery and buyer-matching service. We are not a developer and do not sell property ourselves.</p>
      <h2 className="h-sub">Information on the site</h2>
      <p>Project information is collected from developers and partners and shows the date it was last checked. Prices, availability and payment plans change. Expected handover dates are developer estimates, not guarantees. Always confirm details with the developer and read the sale and purchase agreement before you pay.</p>
      <h2 className="h-sub">No advice</h2>
      <p>Guides are general information, not legal, tax or financial advice.</p>
      <h2 className="h-sub">Contact</h2>
      <p>See the <Link href="/contact/">contact page</Link> and our <Link href="/privacy/">Privacy Policy</Link>.</p>
    </div>
  );
}
