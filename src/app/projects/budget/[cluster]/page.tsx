import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ClusterPage from '@/components/ClusterPage';
import { BUDGET_CLUSTERS, budgetCluster, clusterIndexable, inBudget, publicProjects } from '@/lib/projects';

export const dynamicParams = false;
export function generateStaticParams() { return BUDGET_CLUSTERS.map((c) => ({ cluster: c.slug })); }
type P = Promise<{ cluster: string }>;

function data(slug: string) {
  const c = budgetCluster(slug);
  if (!c) return null;
  return { c, list: publicProjects().filter((p) => inBudget(p, c.min, c.max)) };
}

export async function generateMetadata({ params }: { params: P }): Promise<Metadata> {
  const d = data((await params).cluster);
  if (!d) return {};
  return {
    title: `Dubai Off-Plan Apartments ${d.c.label}`,
    description: `Off-plan apartment projects in Dubai with starting prices ${d.c.label.replace('AED', 'of AED')}.`,
    alternates: { canonical: `/projects/budget/${d.c.slug}/` },
    robots: { index: clusterIndexable(d.list), follow: true },
  };
}

export default async function Page({ params }: { params: P }) {
  const d = data((await params).cluster);
  if (!d) notFound();
  return <ClusterPage title={`Off-plan apartments ${d.c.label}`} intro={`Projects with a published starting price in the ${d.c.label} range.`} href={`/projects/budget/${d.c.slug}/`} list={d.list} />;
}
