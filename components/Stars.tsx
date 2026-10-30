export default function Stars({ value, className = "text-lg" }: { value: number; className?: string }) {
  const pct = (Math.min(5, Math.max(0, value)) / 5) * 100;
  return (
    <span className={`relative inline-block leading-none ${className}`}>
      <span className="text-muted/40">★★★★★</span>
      <span className="absolute left-0 top-0 overflow-hidden whitespace-nowrap text-accent" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}