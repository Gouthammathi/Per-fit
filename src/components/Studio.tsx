import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { api } from '../lib/api';
import { fileToDataURL } from '../lib/image';
import TwinPanel from './TwinPanel';
import SkinPanel from './SkinPanel';
import MirrorStage from './MirrorStage';
import VerdictTag from './VerdictTag';
import Lookbook from './Lookbook';
import Logo from './Logo';
import Section from './Section';

const OCCASIONS = ['a regular day out', 'the office', 'a first date', 'a job interview', 'a wedding guest look', 'a night out'];

type StepState = 'todo' | 'active' | 'done';

function ProgressRail() {
  const { twinPhoto, skin, stage, verdict, verdictStatus } = useStore();
  const steps: { label: string; state: StepState }[] = [
    { label: 'You', state: twinPhoto ? 'done' : 'active' },
    { label: 'Skin', state: skin.status === 'done' ? 'done' : skin.status === 'running' ? 'active' : 'todo' },
    {
      label: 'Look',
      state: stage.phase === 'done' ? 'done' : ['detecting', 'pick', 'running'].includes(stage.phase) ? 'active' : 'todo',
    },
    { label: 'Verdict', state: verdict ? 'done' : verdictStatus === 'running' ? 'active' : 'todo' },
  ];
  return (
    <ol className="hidden items-center gap-3 md:flex" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s.label} className="flex items-center gap-3">
          {i > 0 && <span aria-hidden className={`h-px w-8 ${s.state === 'todo' ? 'bg-line' : 'bg-ink/40'}`} />}
          <span
            className={`flex items-center gap-2 font-tag text-[0.66rem] tracking-[0.14em] uppercase ${
              s.state === 'done' ? 'text-ink' : s.state === 'active' ? 'text-accent' : 'text-ink-soft/60'
            }`}
          >
            {s.state === 'active' && <span aria-hidden className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />}
            0{i + 1} {s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Studio() {
  const { occasion, setOccasion, submitScreenshot, resetAll, stage, verdictStatus, requestVerdict } = useStore();
  const [units, setUnits] = useState<number | null>(null);
  const [custom, setCustom] = useState('');

  useEffect(() => {
    api.credits().then((r) => setUnits(r.units)).catch(() => {});
  }, [stage.phase]);

  // Paste a screenshot anywhere in the studio.
  useEffect(() => {
    async function onPaste(e: ClipboardEvent) {
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith('image/'));
      const file = item?.getAsFile();
      if (file) submitScreenshot(await fileToDataURL(file));
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [submitScreenshot]);

  function chooseOccasion(o: string) {
    setOccasion(o);
    if (stage.phase === 'done' && verdictStatus !== 'running') void requestVerdict();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-porcelain">
      <header className="sticky top-0 z-20 border-b border-line bg-porcelain/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6">
          <Logo className="text-2xl" />
          <ProgressRail />
          <div className="flex items-center gap-5">
            {units !== null && <span className="tag-label hidden sm:inline">{units} units</span>}
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Clear your photos, skin reading and lookbook?')) resetAll();
              }}
              className="link"
            >
              Start fresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 lg:grid-cols-[300px_minmax(0,1fr)_340px]">
        <aside className="order-2 divide-y divide-line px-6 lg:order-1 lg:border-r lg:border-line">
          <TwinPanel />
          <SkinPanel />
        </aside>

        <div className="order-1 p-6 lg:sticky lg:top-16 lg:order-2 lg:h-[calc(100dvh-4rem)] lg:self-start">
          <MirrorStage />
        </div>

        <aside className="order-3 divide-y divide-line px-6 lg:border-l lg:border-line">
          <Section index="03" title="Dressing for">
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => chooseOccasion(o)}
                  aria-pressed={occasion === o}
                  className={`border px-3 py-1.5 text-xs transition ${
                    occasion === o ? 'border-ink bg-ink text-paper' : 'border-line hover:border-ink'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
            <form
              className="mt-4 flex items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (custom.trim()) chooseOccasion(custom.trim());
              }}
            >
              <input
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder="Or describe your own…"
                aria-label="Custom occasion"
                className="min-w-0 flex-1 border-b border-line bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft/70 focus:border-ink"
              />
              <button type="submit" className="tag-label pb-2 !text-ink hover:!text-accent">
                Set →
              </button>
            </form>
          </Section>

          <VerdictTag />
        </aside>
      </main>

      <Lookbook />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-6 py-5">
          <p className="tag-label">Per-fit · YouCam Skin AI + Apparel VTO · Gemini</p>
          <p className="tag-label">Styling guidance, not medical advice</p>
        </div>
      </footer>
    </div>
  );
}
