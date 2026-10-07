import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Request status', robots: { index: false, follow: false } };

export default async function RequestReceived({ searchParams }: { searchParams: Promise<{ ref?: string; status?: string }> }) {
  const { ref, status } = await searchParams;
  const valid = ref && /^DOP-\d{8}-[0-9A-F]{8}$/.test(ref);
  return (
    <div className="container page">
      {valid ? (
        <>
          <h1 className="h-page">Your request has been received</h1>
          <p className="lead">A partner advisor will review your budget and preferences and contact you on WhatsApp to discuss suitable projects.</p>
          <p>Reference: <strong>{ref}</strong></p>
        </>
      ) : status === 'invalid' ? (
        <>
          <h1 className="h-page">Some details are missing</h1>
          <p className="lead">Your request was not saved. Please go back and complete every field, including the consent checkbox.</p>
        </>
      ) : (
        <>
          <h1 className="h-page">We could not save your request</h1>
          <p className="lead">Nothing was submitted. Please try again in a moment or <Link href="/contact/">contact us</Link>.</p>
        </>
      )}
      <p style={{ marginTop: 24 }}><Link href="/" className="link-dark">Back to the homepage</Link></p>
    </div>
  );
}
