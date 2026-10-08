import { projects } from '@/content/projects';
import { editionIndexable, getEdition, visibleEditions } from '@/lib/payment-plan-editions';
import { toCsv } from '@/lib/payment-plan-report';

export const dynamic = 'force-static';
export const dynamicParams = false;
export function generateStaticParams() { return visibleEditions().map((e) => ({ month: e.month })); }

export async function GET(_req: Request, { params }: { params: Promise<{ month: string }> }) {
  const ed = getEdition((await params).month);
  if (!ed) return new Response('Not found', { status: 404 });
  return new Response(toCsv(ed, projects), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `inline; filename="dubai-off-plan-payment-plans-${ed.month}${ed.status === 'demo' ? '-demo' : ''}.csv"`,
      ...(editionIndexable(ed) ? {} : { 'X-Robots-Tag': 'noindex' }),
    },
  });
}
