import { useStore } from '../lib/store';
import Section from './Section';

const VERDICT_META = {
  wear_it: { label: 'Perfect fit', color: 'text-accent-deep' },
  maybe: { label: 'Maybe', color: 'text-ochre' },
  skip: { label: 'Skip it', color: 'text-brick' },
} as const;

export default function VerdictTag() {
  const { stage, verdict, verdictStatus, occasion, requestVerdict } = useStore();

  return (
    <Section index="04" title="Verdict">
      {stage.phase !== 'done' && verdictStatus === 'idle' && (
        <p className="text-xs leading-relaxed text-ink-soft">
          Finish a try-on and your stylist will judge the look for <span className="text-ink italic">{occasion}</span>.
        </p>
      )}

      {stage.phase === 'done' && verdictStatus === 'idle' && !verdict && (
        <p className="text-xs leading-relaxed text-ink-soft">No verdict was saved for this look.</p>
      )}

      {verdictStatus === 'running' && (
        <div className="scanline relative overflow-hidden">
          <p className="tag-label">Looking you over…</p>
          <div className="mt-4 space-y-2.5">
            <div className="h-2 w-3/4 bg-line" />
            <div className="h-2 w-full bg-line/70" />
            <div className="h-2 w-2/3 bg-line/70" />
          </div>
        </div>
      )}

      {verdictStatus === 'error' && (
        <p className="text-xs text-ink-soft">
          The stylist stepped away.{' '}
          <button type="button" onClick={requestVerdict} className="link">
            Ask again
          </button>
        </p>
      )}

      {verdict && verdictStatus !== 'running' && (
        <div className="fade-up" aria-live="polite">
          <p className="tag-label">For {occasion}</p>
          <div className={VERDICT_META[verdict.verdict].color}>
            <p className="mt-2 font-display text-5xl leading-none font-medium">{VERDICT_META[verdict.verdict].label}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="relative h-px flex-1 bg-line">
                <span className="absolute inset-y-0 left-0 bg-current" style={{ width: `${verdict.score}%` }} />
              </span>
              <span className="font-tag text-[0.66rem]">{verdict.score}/100</span>
            </div>
          </div>

          <p className="mt-6 font-display text-xl leading-snug italic">“{verdict.headline}”</p>

          <ol className="mt-5 divide-y divide-line border-y border-line">
            {verdict.reasons.map((r, i) => (
              <li key={i} className="flex gap-3 py-2.5 text-xs leading-relaxed">
                <span className="font-tag text-[0.66rem] text-ink-soft">0{i + 1}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>

          <p className="mt-5 border-l border-blush-deep pl-3 text-xs leading-relaxed text-ink-soft">
            {verdict.skin_harmony}
          </p>

          {verdict.pairing.length > 0 && (
            <>
              <p className="tag-label mt-6 mb-2">Complete it</p>
              <div className="flex flex-wrap gap-2">
                {verdict.pairing.map((p, i) => (
                  <span key={i} className="border border-line px-2.5 py-1 text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Section>
  );
}
