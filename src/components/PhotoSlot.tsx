import { useId, useRef } from 'react';
import { fileToDataURL } from '../lib/image';

export default function PhotoSlot(props: {
  label: string;
  hint: string;
  photo: string | null;
  onPhoto: (dataUrl: string) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="tag-label cursor-pointer">
        {props.label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group relative aspect-[3/4] w-full overflow-hidden border bg-paper transition ${
          props.photo ? 'border-line hover:border-ink' : 'border-dashed border-ink/25 hover:border-ink'
        }`}
      >
        {props.photo ? (
          <>
            <img src={props.photo} alt={props.label} className="h-full w-full object-cover" />
            <span className="tag-label absolute inset-x-0 bottom-0 bg-ink/70 py-2 !text-white opacity-0 transition group-hover:opacity-100">
              Replace
            </span>
          </>
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
            <span className="font-display text-3xl leading-none text-ink-soft transition group-hover:text-ink">+</span>
            <span className="text-xs leading-relaxed text-ink-soft">{props.hint}</span>
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) props.onPhoto(await fileToDataURL(file));
          e.target.value = '';
        }}
      />
    </div>
  );
}
