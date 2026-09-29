export default function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display font-medium ${className}`}>
      Per<span className="text-accent">-</span>
      <span className="italic text-accent-deep">fit</span>
    </span>
  );
}
