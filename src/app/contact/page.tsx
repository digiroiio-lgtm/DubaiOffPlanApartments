import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import { advisorHref } from '@/lib/site';

export const metadata: Metadata = { title: 'Contact', description: 'Contact DubaiOffPlanApartments.com or request project matches from a partner advisor.', alternates: { canonical: '/contact/' } };

export default function ContactPage() {
  const wa = advisorHref();
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Contact', href: '/contact/' }]} />
      <div className="detail-layout">
        <div className="article">
          <h1 className="h-page">Contact us</h1>
          <p className="lead">The fastest way to get help is to send your budget and preferences with the form. A partner advisor will contact you on WhatsApp.</p>
          {wa.startsWith('http') && <p><a href={wa} target="_blank" rel="noopener" data-cta="talk_to_advisor" data-cta-location="contact">Message an advisor on WhatsApp</a></p>}
          <h2 className="h-sub">Privacy and data requests</h2>
          <p>To access, correct or delete the details you submitted, reply to the advisor who contacted you or use the contact details in our <Link href="/privacy/">Privacy Policy</Link>. Please quote your request reference.</p>
          <p>See also our <Link href="/terms/">Terms of use</Link>.</p>
        </div>
        <aside className="detail-aside"><LeadForm location="contact" /></aside>
      </div>
    </div>
  );
}
