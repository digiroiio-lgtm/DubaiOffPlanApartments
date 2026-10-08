import Link from 'next/link';
import { areas } from '@/content/areas';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { Logo } from './Icons';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Link href="/" className="brand footer-brand">
          <Logo size={25} />
          <span>
            <span className="brand-name">{SITE_NAME}</span>
            <span className="footer-tag">{SITE_TAGLINE}</span>
          </span>
        </Link>
        <nav className="footer-links" aria-label="Legal">
          <Link href="/privacy/">Privacy</Link>
          <span aria-hidden="true">|</span>
          <Link href="/contact/">Contact</Link>
        </nav>
      </div>
      {/* Site-wide internal links below the reference footer row. */}
      <div className="footer-sitemap">
        <div className="container footer-sitemap-inner">
          <nav aria-label="Areas">
            <span className="footer-sitemap-label">Areas</span>
            {areas.map((a) => <Link key={a.slug} href={`/areas/${a.slug}/`}>{a.name}</Link>)}
          </nav>
          <nav aria-label="Explore">
            <span className="footer-sitemap-label">Explore</span>
            <Link href="/projects/">Off-plan projects</Link>
            <Link href="/guides/">Buying guides</Link>
            <Link href="/compare/">Compare projects</Link>
            <Link href="/terms/">Terms</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
