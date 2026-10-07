import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Internal', robots: { index: false, follow: false } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="container page admin">{children}</div>;
}
