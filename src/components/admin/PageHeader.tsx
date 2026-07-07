type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
};

/** Dense admin page header — eyebrow + title + optional actions row on the right. */
export function AdminPageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sage-deep">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-3xl text-brand-brown">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Lightweight placeholder card for stub admin pages (phase-in-progress badge). */
export function ComingSoonCard({
  phase,
  title,
  body,
}: {
  phase: string;
  title: string;
  body: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line bg-cream p-8 text-center">
      <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-cream-deep px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-brand-brown">
        Building · phase {phase}
      </div>
      <h2 className="mt-4 font-display text-2xl text-brand-brown">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{body}</p>
    </div>
  );
}
