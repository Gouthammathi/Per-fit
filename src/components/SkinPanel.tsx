import { useState } from 'react';
import { useStore } from '../lib/store';
import { proxied } from '../lib/api';
import { fileToDataURL } from '../lib/image';
import Section from './Section';

const CONCERN_NAMES: Record<string, string> = {
  redness: 'Redness',
  oiliness: 'Oil balance',
  moisture: 'Moisture',
  radiance: 'Radiance',
  acne: 'Clarity',
  texture: 'Texture',
  skin_type: 'Skin type',
};

export default function SkinPanel() {
  const { selfiePhoto, setSelfie, skin, runSkinAnalysis } = useStore();
  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [maskLabel, setMaskLabel] = useState<string | null>(null);

  const scored = skin.output.filter((o) => typeof o.ui_score === 'number' && CONCERN_NAMES[o.type]);
  const skinType = skin.output.find((o) => o.skin_type)?.skin_type;
  const skinAge = skin.output.find((o) => o.type === 'skin_age')?.score;

  return (
    <Section
      index="02"
      title="Skin today"
      action={
        skin.status === 'done' && (
          <button type="button" onClick={runSkinAnalysis} className="link">
            Re-read
          </button>
        )
      }
    >
      {!selfiePhoto && (
        <label className="block cursor-pointer border border-dashed border-ink/25 p-5 text-center transition hover:border-ink">
          <span className="text-xs leading-relaxed text-ink-soft">
            Add a bare-faced selfie to read your skin and tune today's colors.
          </span>
          <span className="tag-label mt-3 block !text-ink">Add selfie →</span>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setSelfie(await fileToDataURL(f));
              e.target.value = '';
            }}
          />
        </label>
      )}

      {selfiePhoto && (
        <div className="flex gap-4">
          <div
            className={`relative w-20 shrink-0 self-start overflow-hidden border border-line ${skin.status === 'running' ? 'scanline' : ''}`}
          >
            <img
              src={maskUrl ?? selfiePhoto}
              alt="Your selfie"
              className="aspect-[3/4] w-full object-cover"
              onError={() => setMaskUrl(null)}
            />
            {maskLabel && maskUrl && (
              <button
                type="button"
                className="tag-label absolute inset-x-0 bottom-0 bg-ink/70 py-0.5 text-center !text-[0.58rem] !text-white"
                onClick={() => {
                  setMaskUrl(null);
                  setMaskLabel(null);
                }}
              >
                {maskLabel} ✕
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            {skin.status === 'idle' && (
              <div className="flex h-full flex-col items-start justify-center gap-3">
                <p className="text-xs leading-relaxed text-ink-soft">Seven concerns, scored by YouCam Skin AI in seconds.</p>
                <button type="button" onClick={runSkinAnalysis} className="btn btn-line btn-sm">
                  Read my skin
                </button>
              </div>
            )}
            {skin.status === 'running' && <p className="tag-label pt-1">Reading your skin…</p>}
            {skin.status === 'error' && (
              <div className="text-xs leading-relaxed text-brick">
                {skin.error}
                <button type="button" onClick={runSkinAnalysis} className="link ml-2">
                  Retry
                </button>
              </div>
            )}
            {skin.status === 'done' && (
              <ul className="space-y-2.5">
                {scored.map((o) => (
                  <li key={o.type}>
                    <button
                      type="button"
                      className="group w-full text-left"
                      title="Show detection areas"
                      onClick={() => {
                        if (o.mask_urls?.[0]) {
                          setMaskUrl(proxied(o.mask_urls[0]));
                          setMaskLabel(CONCERN_NAMES[o.type]);
                        }
                      }}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-xs group-hover:text-blush-deep">{CONCERN_NAMES[o.type]}</span>
                        <span className="font-tag text-[0.66rem] text-ink-soft">{o.ui_score}</span>
                      </span>
                      <span className="mt-1 block h-px bg-line">
                        <span className="block h-px bg-blush-deep" style={{ width: `${o.ui_score}%` }} />
                      </span>
                    </button>
                  </li>
                ))}
                {(skinType || skinAge) && (
                  <li className="tag-label pt-1">
                    {skinType && <>type · {skinType}</>}
                    {skinType && skinAge ? '  ·  ' : ''}
                    {skinAge && <>age · {Math.round(skinAge)}</>}
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Today's brief from Gemini */}
      {skin.status === 'done' && (
        <div className="mt-6 border-t border-line pt-5">
          {skin.briefStatus === 'running' && <p className="tag-label">Writing today's brief…</p>}
          {skin.briefStatus === 'error' && <p className="text-xs text-ink-soft">Brief unavailable.</p>}
          {skin.brief && (
            <div className="fade-up">
              <p className="font-display text-xl leading-snug italic">“{skin.brief.headline}”</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">{skin.brief.summary}</p>

              {skin.brief.care_focus.length > 0 && (
                <ol className="mt-4 space-y-2">
                  {skin.brief.care_focus.map((c, i) => (
                    <li key={c.title} className="flex gap-3 text-xs leading-relaxed">
                      <span className="font-tag text-[0.66rem] text-ink-soft">0{i + 1}</span>
                      <span>
                        <span className="font-medium">{c.title}.</span> <span className="text-ink-soft">{c.action}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              <p className="tag-label mt-6 mb-3">Today's palette</p>
              <div className="grid grid-cols-4 gap-2">
                {skin.brief.palette.wear.map((c) => (
                  <div key={c.hex} title={c.why}>
                    <span className="block aspect-square border border-ink/10" style={{ background: c.hex }} />
                    <span className="mt-1 block truncate text-[10px] text-ink-soft">{c.name}</span>
                  </div>
                ))}
              </div>
              {skin.brief.palette.avoid.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="tag-label">Avoid</span>
                  {skin.brief.palette.avoid.map((c) => (
                    <span key={c.hex} className="flex items-center gap-1.5" title={c.why}>
                      <span className="h-3 w-3 border border-ink/10 opacity-60" style={{ background: c.hex }} />
                      <span className="text-[11px] text-ink-soft line-through decoration-ink/30">{c.name}</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-4 text-[11px] leading-relaxed text-ink-soft">{skin.brief.palette.guidance}</p>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
