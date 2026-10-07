import Link from 'next/link';
import { advisorHref, SITE_NAME } from '@/lib/site';
import { Logo, WhatsApp } from './Icons';

export default function SiteHeader() {
  const href = advisorHref();
  const external = href.startsWith('http');
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`${SITE_NAME} home`}>
          <Logo />
          <span className="brand-name">{SITE_NAME}</span>
        </Link>
        <nav className="main-nav" aria-label="Main">
          <Link href="/projects/">Projects</Link>
          <Link href="/areas/">Areas</Link>
          <Link href="/guides/">Buying Guide</Link>
        </nav>
        <a className="btn-advisor" href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})} data-cta="talk_to_advisor" data-cta-location="header">
          <WhatsApp /> <span>Talk to an advisor</span>
        </a>
        <details className="mobile-nav">
          <summary aria-label="Menu"><span /><span /><span /></summary>
          <nav aria-label="Mobile">
            <Link href="/projects/">Projects</Link>
            <Link href="/areas/">Areas</Link>
            <Link href="/guides/">Buying Guide</Link>
            <Link href="/compare/">Compare</Link>
            <a href={href} data-cta="talk_to_advisor" data-cta-location="mobile_nav">Talk to an advisor</a>
          </nav>
        </details>
      </div>
    </header>
  );
}
