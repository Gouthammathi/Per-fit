import { useStore } from '../lib/store';
import { fileToDataURL } from '../lib/image';
import Section from './Section';

export default function TwinPanel() {
  const { twinPhoto, setTwin } = useStore();
  return (
    <Section index="01" title="You">
      <label className="group relative block cursor-pointer overflow-hidden border border-line">
        {twinPhoto && <img src={twinPhoto} alt="Your full-body photo" className="aspect-[3/4] w-full object-cover" />}
        <span className="tag-label absolute inset-x-0 bottom-0 bg-ink/70 py-2 text-center !text-white opacity-0 transition group-hover:opacity-100">
          Replace photo
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) await setTwin(await fileToDataURL(f));
            e.target.value = '';
          }}
        />
      </label>
      <p className="mt-3 text-xs leading-relaxed text-ink-soft">
        Every look is tried on this photo. Front-facing and full-length works best.
      </p>
    </Section>
  );
}
