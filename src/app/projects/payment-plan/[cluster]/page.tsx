import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClusterPage from '@/components/ClusterPage';
import { clusterIndexable, PLAN_CLUSTERS, planCluster, publicProjects } from '@/lib/projects';

export const dynamicParams = false;
export function generateStaticParams() { return PLAN_CLUSTERS.map((c) => ({ cluster: c.slug })); }
type P = Promise<{ cluster: string }>;

function data(slug: string) {
  const c = planCluster(slug);
  if (!c) return null;
  return { c, list: publicProjects().filter(c.test) };
}

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const d = data((await params).cluster);
  if (!d) return {};
  return {
    title: `Dubai Off-Plan Projects: ${d.c.label}`,
    description: `Dubai off-plan apartment projects with ${d.c.label.toLowerCase()}.`,
    alternates: { canonical: `/projects/payment-plan/${d.c.slug}/` },
    robots: { index: clusterIndexable(d.list), follow: true },
  };
}

export default async function Page({ params }: { params: P }) {
  const d = data((await params).cluster);
  if (!d) notFound();
  return <ClusterPage title={d.c.label} intro="Projects grouped by the structure of their published payment plan." href={`/projects/payment-plan/${d.c.slug}/`} list={d.list} />;
}
