import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { CONSENT_TEXT, CONSENT_VERSION } from '@/lib/leads/options';

export const metadata: Metadata = { title: 'Privacy Policy', description: 'How DubaiOffPlanApartments.com collects, uses and shares the details you submit.', alternates: { canonical: '/privacy/' } };

export default function PrivacyPage() {
  return (
    <div className="container page article narrow">
      <Breadcrumbs items={[{ name: 'Privacy', href: '/privacy/' }]} />
      <h1 className="h-page">Privacy Policy</h1>
      <p className="notice">Draft for review: this policy must be reviewed by a qualified adviser and completed with the operator&apos;s legal name and contact details before launch.</p>
      <h2 className="h-sub">What we collect</h2>
      <p>When you request project matches we collect your total budget, available initial payment, buying timeline, preferred area and apartment type, purpose of purchase, name and WhatsApp number, plus the page you submitted from and campaign (UTM) tags. We also record your consent, the consent wording version and the time.</p>
      <h2 className="h-sub">Why we use it</h2>
      <p>To review your request, contact you about suitable projects and, with your consent, share your request with one partner advisor who can help you.</p>
      <h2 className="h-sub">Consent</h2>
      <p>The consent you give with the form reads (version {CONSENT_VERSION}):</p>
      <blockquote>{CONSENT_TEXT}</blockquote>
      <p>The checkbox is never pre-ticked. You can withdraw consent at any time.</p>
      <h2 className="h-sub">Sharing</h2>
      <p>We do not sell your details or publish them. We share a request only with the partner advisor handling it. We do not put personal details in page addresses or analytics events.</p>
      <h2 className="h-sub">Retention and your rights</h2>
      <p>We keep requests only as long as needed to handle them. You can ask to access, correct or delete your details via the <Link href="/contact/">contact page</Link>.</p>
      <p>See also our <Link href="/terms/">Terms of use</Link>.</p>
    </div>
  );
}
