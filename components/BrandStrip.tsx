"use client";
import { useEffect, useRef } from "react";
import type { Brand } from "@/lib/data";
import { useLang } from "@/lib/lang";

function Tile({ b, onPick }: { b: Brand; onPick?: (b: Brand) => void }) {
  const { t } = useLang();
  return (
    <button onClick={() => onPick?.(b)} className="group block w-full text-center">
      <div className="relative aspect-[3/4] overflow-hidden border border-line transition-colors duration-700 group-hover:border-accent/50">
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-105"
          style={{
            backgroundImage: b.image
              ? `url(${b.image}), linear-gradient(165deg, #1d1a13, #0c0c0d)`
              : "linear-gradient(165deg, #1d1a13, #0c0c0d)",
          }}
        />
        {!b.image && (
          <span className="absolute inset-x-0 bottom-5 text-[11px] uppercase tracking-[0.22em] text-muted">{t("brand.photo")}</span>
        )}
        <div className="pointer-events-none absolute inset-3.5 border border-accent/15" />
      </div>
      <p className="pt-4 font-serif text-xl text-fg">{b.name}</p>
      <span className="text-[11px] uppercase tracking-[0.25em] text-accent">{t("brand.pick")}</span>
    </button>
  );
}

export default function BrandStrip({ brands, onPick }: { brands: Brand[]; onPick?: (b: Brand) => void }) {
  const { t } = useLang();
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const vel = useRef(0);
  const hover = useRef(false);
  const many = brands.length > 4;

  useEffect(() => {
    if (!many) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const loop = (ts: number) => {
      const dt = Math.min(ts - last, 50);
      last = ts;
      const tr = track.current;
      if (tr) {
        const half = tr.scrollWidth / 2;
        const base = reduce ? 0 : 0.04;
        const speed = hover.current ? vel.current : base;
        pos.current = (((pos.current + speed * dt) % half) + half) % half;
        tr.style.transform = `translate3d(${-pos.current}px, 0, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [many]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    hover.current = true;
    vel.current = Math.abs(x) < 0.12 ? 0 : x * 1.2;
  }

  if (brands.length === 0) return null;

  if (!many) {
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {brands.map((b) => (
          <Tile key={b.id} b={b} onPick={onPick} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div ref={wrap} className="overflow-hidden" onMouseMove={onMove} onMouseLeave={() => (hover.current = false)}>
        <div ref={track} className="flex w-max will-change-transform">
          {[...brands, ...brands].map((b, i) => (
            <div key={b.id + "-" + i} className="mr-5 w-[260px] shrink-0 md:w-[300px]">
              <Tile b={b} onPick={onPick} />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{t("brand.hint")}</p>
    </div>
  );
}