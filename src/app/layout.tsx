import type { Metadata, Viewport } from 'next';
import { Figtree, Source_Serif_4 } from 'next/font/google';
import Script from 'next/script';
import AnalyticsListener from '@/components/AnalyticsListener';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { siteJsonLd } from '@/lib/schema';
import { SITE_NAME, siteUrl } from '@/lib/site';
import './globals.css';

const sans = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-serif', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl('/')),
  title: { default: `Dubai Off-Plan Apartments: Compare Projects & Payment Plans | ${SITE_NAME}`, template: `%s | ${SITE_NAME}` },
  description: 'Compare Dubai off-plan apartment projects, payment plans and expected handover dates, and request 3 options matched to your budget.',
  openGraph: { siteName: SITE_NAME, type: 'website', locale: 'en_AE' },
  icons: { icon: '/logo.svg', apple: '/logo-512.png' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0F2340' };

const GA = process.env.NEXT_PUBLIC_GA4_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }} />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <AnalyticsListener />
        {GA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}',{anonymize_ip:true});`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
