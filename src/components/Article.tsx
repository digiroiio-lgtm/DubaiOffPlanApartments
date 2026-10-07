import type { Area, Guide } from '@/content/types';

export function ArticleBody({ doc }: { doc: Area | Guide }) {
  return (
    <div className="article">
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h2 className="h-sub">{s.heading}</h2>
          {s.body.map((b, i) => <p key={i}>{b}</p>)}
        </section>
      ))}
      <aside className="sources">
        <p><strong>Last updated:</strong> <time dateTime={doc.updated}>{new Date(doc.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></p>
        <p><strong>Sources:</strong></p>
        <ul>{doc.sources.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener">{s.label}</a></li>)}</ul>
        <p className="muted">General information only, not legal or financial advice. Fees and rules change; confirm current details with the official source.</p>
      </aside>
    </div>
  );
}
