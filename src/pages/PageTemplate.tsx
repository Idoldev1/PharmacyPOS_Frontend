interface PageTemplateProps {
  title: string;
  description: string;
  cards: Array<{ label: string; value: string }>;
}

export function PageTemplate({ title, description, cards }: PageTemplateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={`${card.label}-${card.value}`}
            className="rounded-2xl bg-white p-5 shadow"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-slate-900">Workspace</h3>
        <p className="mt-2 text-sm text-slate-600">
          This module is now aligned to the pharmacy POS design system and ready
          for feature-level implementation.
        </p>
      </section>
    </div>
  );
}
