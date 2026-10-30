import { Product, catEmoji } from "@/lib/data";

export default function Thumb({ p, className = "" }: { p: Product; className?: string }) {
  return p.image ? (
    <img src={p.image} alt={p.name} className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-soft ${className}`}>
      <span className="text-5xl">{catEmoji(p.cat)}</span>
    </div>
  );
}