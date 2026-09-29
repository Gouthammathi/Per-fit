/** Viewfinder corner marks; place inside a `relative` parent. */
export default function Corners({ className = 'border-ink/35' }: { className?: string }) {
  const base = `pointer-events-none absolute h-3.5 w-3.5 ${className}`;
  return (
    <>
      <span aria-hidden className={`${base} top-0 left-0 border-t border-l`} />
      <span aria-hidden className={`${base} top-0 right-0 border-t border-r`} />
      <span aria-hidden className={`${base} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden className={`${base} right-0 bottom-0 border-r border-b`} />
    </>
  );
}
