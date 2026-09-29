import { useState } from 'react';
import { useStore } from '../lib/store';
import { fileToDataURL, urlToDataURL } from '../lib/image';
import BeforeAfter from './BeforeAfter';
import Corners from './Corners';

const SAMPLES = [
  { src: '/samples/street_model.png', label: 'Street' },
  { src: '/samples/garment_dress.png', label: 'Slip dress' },
  { src: '/samples/garment_jacket.png', label: 'Blazer' },
];

function StatusBar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3">{children}</div>;
}

export default function MirrorStage() {
  const { stage, twinPhoto, submitScreenshot, pickGarment, clearStage } = useStore();
  const [dragOver, setDragOver] = useState(false);

  async function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file && file.type.startsWith('image/')) submitScreenshot(await fileToDataURL(file));
  }

  return (
    <div
      className={`relative flex h-full min-h-[560px] flex-col border bg-paper transition ${
        dragOver ? 'border-accent bg-accent-tint/40' : 'border-line'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        onFiles(e.dataTransfer.files);
      }}
    >
      {stage.phase === 'empty' && (
        <div className="relative m-4 flex flex-1 flex-col items-center justify-center gap-7 p-8 text-center">
          <Corners className={dragOver ? 'border-accent' : 'border-ink/25'} />
          <p className="tag-label">Drop · Paste · Choose</p>
          <p className="font-display text-5xl leading-[1.05] font-medium">
            Drop any <span className="italic text-accent-deep">screenshot</span>
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
            A shop page, a social post, a street photo — Per-fit finds the clothes in it. You can also paste straight
            from your clipboard.
          </p>
          <label className="btn btn-line cursor-pointer">
            Choose an image
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </label>
          <div className="mt-2">
            <p className="tag-label mb-3">Or try a sample</p>
            <div className="flex justify-center gap-3">
              {SAMPLES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={async () => submitScreenshot(await urlToDataURL(s.src))}
                  className="group w-20 shrink-0 text-left"
                  title={s.label}
                >
                  <span className="block overflow-hidden border border-line transition group-hover:border-ink">
                    <img
                      src={s.src}
                      alt={s.label}
                      className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-1.5 block truncate font-tag text-[0.6rem] text-ink-soft">
                    {String(i + 1).padStart(2, '0')} {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {stage.phase === 'detecting' && (
        <>
          <div className="scanline relative min-h-0 flex-1 overflow-hidden">
            <img src={stage.screenshot} alt="Your screenshot" className="h-full w-full object-contain opacity-80" />
          </div>
          <StatusBar>
            <span className="flex items-center gap-2 tag-label !text-accent">
              <span aria-hidden className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Reading the look
            </span>
            <span className="tag-label">Finding garments…</span>
          </StatusBar>
        </>
      )}

      {stage.phase === 'pick' && (
        <>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="relative max-h-full max-w-full">
                <img src={stage.screenshot} alt="Your screenshot" className="max-h-[58vh] w-auto" />
                {stage.garments.map((g, i) => {
                  const [ymin, xmin, ymax, xmax] = g.box_2d;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pickGarment(g)}
                      className="group absolute border border-white/90 bg-accent/0 outline-1 outline-transparent transition hover:bg-accent/15 hover:outline-accent-deep focus-visible:outline-accent-deep"
                      style={{
                        top: `${ymin / 10}%`,
                        left: `${xmin / 10}%`,
                        width: `${(xmax - xmin) / 10}%`,
                        height: `${(ymax - ymin) / 10}%`,
                      }}
                    >
                      <span className="absolute -top-px left-0 -translate-y-full bg-ink px-1.5 py-0.5 font-tag text-[0.6rem] tracking-wider whitespace-nowrap text-white uppercase group-hover:bg-accent-deep">
                        {String(i + 1).padStart(2, '0')} {g.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <StatusBar>
            <span className="tag-label !text-ink">{stage.garments.length} pieces found</span>
            <span className="tag-label">Tap one to try it on</span>
          </StatusBar>
        </>
      )}

      {stage.phase === 'running' && twinPhoto && (
        <>
          <div className="scanline relative min-h-0 flex-1 overflow-hidden">
            <img src={twinPhoto} alt="You" className="h-full w-full object-cover opacity-90" />
            <div className="absolute right-5 bottom-5 w-20 border border-paper bg-paper p-1">
              <img src={stage.garment.crop} alt={stage.garment.label} className="aspect-[3/4] w-full object-cover" />
            </div>
          </div>
          <StatusBar>
            <span className="flex items-center gap-2 tag-label !text-accent">
              <span aria-hidden className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
              Tailoring
            </span>
            <span className="tag-label truncate">{stage.garment.label} onto you…</span>
          </StatusBar>
        </>
      )}

      {stage.phase === 'done' && twinPhoto && (
        <>
          <div className="min-h-0 flex-1">
            <BeforeAfter before={twinPhoto} after={stage.result} altAfter={`You wearing ${stage.garment.label}`} />
          </div>
          <StatusBar>
            <div className="flex min-w-0 items-center gap-3">
              <img src={stage.garment.crop} alt="" className="h-11 w-8 border border-line object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{stage.garment.label}</p>
                <p className="tag-label">{stage.garment.category.replace('_', ' ')}</p>
              </div>
            </div>
            <button type="button" onClick={clearStage} className="btn btn-line btn-sm shrink-0">
              Try another
            </button>
          </StatusBar>
        </>
      )}

      {stage.phase === 'error' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 p-8 text-center">
          <p className="tag-label !text-brick">Something went wrong</p>
          <p className="font-display text-3xl">That one didn't work</p>
          <p className="max-w-sm text-sm leading-relaxed text-ink-soft">{stage.message}</p>
          <button type="button" onClick={clearStage} className="btn btn-solid">
            Start over
          </button>
        </div>
      )}
    </div>
  );
}
