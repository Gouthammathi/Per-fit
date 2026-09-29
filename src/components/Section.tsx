import type { ReactNode } from 'react';

export default function Section(props: { index: string; title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="py-7">
      <header className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="flex items-baseline gap-3">
          <span className="font-tag text-[0.66rem] text-accent">{props.index}</span>
          <span className="font-display text-2xl font-medium">{props.title}</span>
        </h2>
        {props.action}
      </header>
      {props.children}
    </section>
  );
}
