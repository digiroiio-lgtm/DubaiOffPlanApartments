import type { Project } from '@/content/types';
import { MIN_VERIFIED_FOR_INDEX } from '@/lib/projects';
import Breadcrumbs from './Breadcrumbs';
import { CompareBar } from './CompareToggle';
import ProjectCard from './ProjectCard';

export default function ClusterPage({ title, intro, href, list }: { title: string; intro: string; href: string; list: Project[] }) {
  const verified = list.filter((p) => p.status === 'verified').length;
  return (
    <div className="container page">
      <Breadcrumbs items={[{ name: 'Projects', href: '/projects/' }, { name: title, href }]} />
      <h1 className="h-page">{title}</h1>
      <p className="lead">{intro}</p>
      {verified < MIN_VERIFIED_FOR_INDEX && (
        <p className="notice">This collection has {verified} verified project{verified === 1 ? '' : 's'} so far. It will be published for search once it has at least {MIN_VERIFIED_FOR_INDEX}.</p>
      )}
      {list.length ? <div className="project-grid">{list.map((p) => <ProjectCard key={p.slug} p={p} />)}</div> : <p className="muted">No projects in this collection yet.</p>}
      <CompareBar />
    </div>
  );
}
