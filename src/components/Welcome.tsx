import { useState } from 'react';
import { useStore } from '../lib/store';
import { urlToDataURL } from '../lib/image';
import PhotoSlot from './PhotoSlot';
import Logo from './Logo';
import Corners from './Corners';

const STEPS = [
  { title: 'Add your photo', body: 'One full-body shot becomes your fitting-room double.' },
  { title: 'Drop a screenshot', body: 'Any shop page or post — we find the clothes in it.' },
  { title: 'Get your fit', body: 'See it on you, with an honest stylist verdict.' },
];

export default function Welcome() {
  const { setTwin, setSelfie } = useStore();
  const [mode, setMode] = useState<'hero' | 'setup'>('hero');
  const [twinDraft, setTwinDraft] = useState<string | null>(null);
  const [selfieDraft, setSelfieDraft] = useState<string | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);

  async function startDemo() {
    setLoadingDemo(true);
    try {
      const [person, selfie] = await Promise.all([
        urlToDataURL('/samples/person.png'),
        urlToDataURL('/samples/selfie.png'),
      ]);
      setSelfie(selfie);
      await setTwin(person); // setting the twin last flips App into the studio
    } finally {
      setLoadingDemo(false);
    }
  }

  async function finishSetup() {
    if (!twinDraft) return;
    if (selfieDraft) setSelfie(selfieDraft);
    await setTwin(twinDraft);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-porcelain">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Logo className="text-2xl" />
          <p className="tag-label hidden sm:block">Virtual fitting room</p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-12 px-6 py-12 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:py-14">
        <section className="flex flex-col justify-center lg:col-span-6">
          <p className="tag-label">Nº 01 — Try before you buy</p>
          <h1 className="mt-6 font-display text-6xl leading-[0.95] font-medium tracking-tight sm:text-7xl xl:text-8xl">
            Every look,
            <br />
            <span className="italic text-accent-deep">on you.</span>
          </h1>
          <p className="mt-7 max-w-md leading-relaxed font-light text-ink-soft">
            Drop a screenshot of anything you like. Per-fit dresses you in it, then tells you honestly whether it suits
            your skin, your colors and your day.
          </p>

          {mode === 'hero' ? (
            <div className="fade-up">
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <button type="button" onClick={startDemo} disabled={loadingDemo} className="btn btn-solid">
                  {loadingDemo ? 'Setting up…' : 'Try the demo'}
                  <span aria-hidden>→</span>
                </button>
                <button type="button" onClick={() => setMode('setup')} className="link">
                  Use my own photos
                </button>
              </div>

              <ol className="mt-14 grid max-w-xl border-t border-line sm:grid-cols-3">
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    className="border-b border-line py-5 sm:border-b-0 sm:pr-5 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:pl-5"
                  >
                    <p className="font-tag text-[0.66rem] text-accent">0{i + 1}</p>
                    <p className="mt-2 text-sm font-medium">{s.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="fade-up mt-10 max-w-md">
              <div className="grid grid-cols-2 gap-4">
                <PhotoSlot
                  label="Full-body · required"
                  hint="Front-facing, standing, whole body in frame"
                  photo={twinDraft}
                  onPhoto={setTwinDraft}
                />
                <PhotoSlot
                  label="Selfie · optional"
                  hint="Close up, bare face, even light"
                  photo={selfieDraft}
                  onPhoto={setSelfieDraft}
                />
              </div>
              <div className="mt-8 flex items-center gap-6">
                <button type="button" onClick={finishSetup} disabled={!twinDraft} className="btn btn-solid">
                  Enter the fitting room
                  <span aria-hidden>→</span>
                </button>
                <button type="button" onClick={() => setMode('hero')} className="link">
                  Back
                </button>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-ink-soft">
                Photos are sent to Perfect Corp's YouCam AI for analysis and try-on, and the finished try-on image is
                sent to Google Gemini for styling feedback. Your originals are kept on this device.
              </p>
            </div>
          )}
        </section>

        <figure className="lg:col-span-6 lg:pl-8">
          <div className="relative p-3">
            <Corners />
            <div className="h-[60vh] min-h-[420px] overflow-hidden bg-ink lg:h-[calc(100dvh-16rem)]">
              <img
                src="/hero.jpg"
                alt="A woman trying on a blue dress on a virtual fitting-room screen, with garment and color options beside it"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <figcaption className="mt-3 flex justify-between px-3">
            <span className="tag-label">Fig. 1</span>
            <span className="tag-label">Your fitting room, anywhere</span>
          </figcaption>
        </figure>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-6 py-5 lg:px-10">
          <p className="tag-label">YouCam Skin AI · Apparel VTO · Gemini</p>
          <p className="tag-label">Styling guidance, not medical advice</p>
        </div>
      </footer>
    </div>
  );
}
