import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleBody } from '@/components/Article';
import Breadcrumbs from '@/components/Breadcrumbs';
import LeadForm from '@/components/LeadForm';
import ProjectCard from '@/components/ProjectCard';
import { areas, getArea } from '@/content/areas';
import { guides } from '@/content/guides';
import { publicProjects } from '@/lib/projects';

export const dynamicParams = false;
export function generateStaticParams() { return areas.map((a) => ({ slug: a.slug })); }
type P = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const a = getArea((await params).slug);
  if (!a) return {};
  return { title: `${a.name} Off-Plan Apartments: Area Guide`, description: a.intro.slice(0, 155), alternates: { canonical: `/areas/${a.slug}/` } };
}

export default async function AreaPage({ params }: { params: P }) {
  const a = getArea((await params).slug);
  if (!a) notFound();
  const list = publicProjects().filter((p) => p.area === a.slug).slice(0, 4);
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Areas', href: '/areas/' }, { name: a.name, href: `/areas/${a.slug}/` }]} />
      <div className="detail-layout">
        <div>
          <h1 className="h-page">{a.name}</h1>
          <p className="lead">{a.intro}</p>
          <ArticleBody doc={a} />
          <h2 className="h-sub">Projects in {a.shortName}</h2>
          {list.length ? <div className="project-grid two">{list.map((p) => <ProjectCard key={p.slug} p={p} />)}</div> : <p className="muted">No projects listed yet.</p>}
          <p style={{ marginTop: 12 }}><Link className="link-dark" href={`/projects/?area=${a.slug}`}>All projects in {a.shortName}</Link> · <Link className="link-dark" href="/payment-plan-comparison/">Monthly payment plan comparison</Link></p>
          <h2 className="h-sub">Related guides</h2>
          <ul>{guides.slice(0, 3).map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}/`}>{g.title}</Link></li>)}</ul>
        </div>
        <aside className="detail-aside"><LeadForm location={`area_${a.slug}`} defaultArea={a.slug} /></aside>
      </div>
    </div>
  );
}
