import { useStore } from '../lib/store';

const VERDICT = {
  wear_it: { label: 'Perfect fit', color: 'text-accent-deep' },
  maybe: { label: 'Maybe', color: 'text-ochre' },
  skip: { label: 'Skip it', color: 'text-brick' },
} as const;

export default function Lookbook() {
  const { lookbook, openLookbookEntry } = useStore();
  if (!lookbook.length) return null;
  return (
    <section aria-label="Lookbook" className="border-t border-line">
      <div className="mx-auto max-w-[1440px] px-6 py-8">
        <header className="mb-5 flex items-baseline justify-between">
          <h2 className="flex items-baseline gap-3">
            <span className="font-tag text-[0.66rem] text-accent">05</span>
            <span className="font-display text-2xl font-medium">Lookbook</span>
          </h2>
          <span className="tag-label">{lookbook.length} looks</span>
        </header>
        <div className="flex gap-5 overflow-x-auto pb-2">
          {lookbook.map((e, i) => (
            <button
              key={e.id}
              type="button"
              onClick={() => openLookbookEntry(e.id)}
              className="group w-28 shrink-0 text-left"
              title={`${e.garmentLabel} — ${e.occasion}`}
            >
              <span className="block overflow-hidden border border-line transition group-hover:border-ink">
                <img
                  src={e.result}
                  alt={`Try-on: ${e.garmentLabel}`}
                  className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </span>
              <span className="mt-2 block font-tag text-[0.6rem] text-ink-soft">
                {String(i + 1).padStart(2, '0')}
                {e.verdict && (
                  <span className={`ml-2 ${VERDICT[e.verdict.verdict].color}`}>{VERDICT[e.verdict.verdict].label}</span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs">{e.garmentLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
