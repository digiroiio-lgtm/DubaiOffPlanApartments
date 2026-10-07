import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Arrow, Chat, Coins, Pin } from '@/components/Icons';
import LeadForm from '@/components/LeadForm';
import { getArea } from '@/content/areas';

export const metadata: Metadata = { alternates: { canonical: '/' } };

const featuredAreas = ['jvc', 'business-bay', 'dubai-south'].map((s) => getArea(s)!);

const steps = [
  ['01', 'Tell us your budget', 'Share your preferences and buying plans.'],
  ['02', 'Receive 3 matched projects', 'Get a tailored shortlist based on your criteria.'],
  ['03', 'Compare with an advisor', 'Discuss the options and get personalised guidance.'],
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <Image src="/images/hero-dubai-waterfront.webp" alt="" fill priority sizes="100vw" className="hero-img" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow eyebrow-light">Dubai off-plan apartments</p>
            <h1>
              Your next Dubai<br />apartment<br /><span className="gold">starts here.</span>
            </h1>
            <p className="hero-sub">Compare projects, payment plans and handover dates. Get 3 options matched to your budget.</p>
            <div className="hero-actions">
              <a href="#match-form" className="btn btn-green btn-lg" data-cta="find_my_3_matches" data-cta-location="hero">
                Find my 3 matches <Arrow size={15} />
              </a>
              <Link href="/projects/" className="link-light" data-cta="explore_projects" data-cta-location="hero">
                Explore projects <Arrow size={13} />
              </Link>
            </div>
          </div>
          <div className="hero-form">
            <LeadForm location="hero" />
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Why use DubaiOffPlanApartments.com">
        <div className="container benefits-inner">
          <div className="benefit">
            <span className="benefit-icon"><Coins /></span>
            <div><h2>Compare payment plans</h2><p>See options across multiple projects <br />in one place.</p></div>
          </div>
          <div className="benefit">
            <span className="benefit-icon"><Pin /></span>
            <div><h2>Explore Dubai communities</h2><p>Discover areas that match <br />your lifestyle and goals.</p></div>
          </div>
          <div className="benefit">
            <span className="benefit-icon"><Chat /></span>
            <div><h2>Speak with a partner advisor</h2><p>Get personalised guidance <br />on your shortlisted projects.</p></div>
          </div>
        </div>
      </section>

      <section className="areas-home">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="h-section">Explore apartments by area</h2>
              <p className="section-sub">Start with the location that fits your plans.</p>
            </div>
            <Link href="/areas/" className="link-dark">View all areas <Arrow size={12} /></Link>
          </div>
          <div className="area-grid">
            {featuredAreas.map((a) => (
              <article className="area-card" key={a.slug}>
                <Link href={`/areas/${a.slug}/`} className="area-img" tabIndex={-1} aria-hidden="true">
                  <Image src={a.image!} alt={a.imageAlt} fill sizes="(max-width: 760px) 100vw, 33vw" />
                </Link>
                <div className="area-body">
                  <h3><Link href={`/areas/${a.slug}/`}>{a.name}</Link></h3>
                  <p>{a.tagline}</p>
                  <Link href={`/projects/?area=${a.slug}`} className="link-dark" data-cta="area_explore_projects" data-cta-location={`home_area_${a.slug}`}>
                    Explore projects <Arrow size={11} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compare-home">
        <div className="compare-panel">
          <div className="compare-left">
            <p className="eyebrow">Comparison preview</p>
            <h2 className="h-section">A clearer way to compare.</h2>
            <p className="section-sub">See key details side by side, then discuss the best options with a partner advisor.</p>
            <div className="table-wrap">
              <table className="compare-preview">
                <thead><tr><th scope="col"><span className="sr-only">Detail</span></th><th scope="col">Project A</th><th scope="col">Project B</th><th scope="col">Project C</th></tr></thead>
                <tbody>
                  {['Starting price', 'Payment schedule', 'Expected handover'].map((r) => (
                    <tr key={r}><th scope="row">{r}</th><td>—</td><td>—</td><td>—</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ol className="steps">
            {steps.map(([n, t, d]) => (
              <li key={n}><span className="step-num">{n}</span><div><h3>{t}</h3><p>{d}</p></div></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta-band">
        <Image src="/images/cta-dubai-skyline.webp" alt="" fill sizes="100vw" className="cta-img" />
        <div className="container cta-inner">
          <h2>Which Dubai project fits your budget?</h2>
          <p>Get a personalised shortlist on WhatsApp.</p>
          <a href="#match-form" className="btn btn-green btn-cta" data-cta="find_my_3_matches" data-cta-location="bottom_cta">
            Find my 3 matches <Arrow size={14} />
          </a>
        </div>
      </section>
    </>
  );
}
