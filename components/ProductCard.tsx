"use client";
import { useState } from "react";
import Link from "next/link";
import { Product, vnd } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/lang";
import Thumb from "@/components/Thumb";
import { flyToCart } from "@/components/Fx";
import Viewer3D, { Btn3D, has3D } from "@/components/Viewer3D";

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useStore();
  const { t, locale } = useLang();
  const [view, setView] = useState(false);
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const second = p.images && p.images.length > 1 ? p.images[1] : "";

  return (
    <>
      <div className="group relative">
        {off > 0 && (
          <span className="absolute left-3 top-3 z-10 bg-accent px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent-fg">-{off}%</span>
        )}
        {has3D(p) && <Btn3D onClick={() => setView(true)} className="absolute right-3 top-3 z-10" />}

        <Link href={`/product/${p.id}`} className="block">
          <div className="relative aspect-[3/4] overflow-hidden border border-line transition-colors duration-700 group-hover:border-accent/50">
            <Thumb p={p} className="h-full w-full" />
            {second && (
              <img
                src={second}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
            {p.video && (
              <span className="absolute bottom-3 right-3 rounded-full border border-accent/40 bg-black/70 px-2 py-0.5 text-xs text-accent">▶ Video</span>
            )}
          </div>

          <div className="space-y-1.5 pt-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">{p.brand}</p>
            <h3 className="line-clamp-2 min-h-[3.1rem] font-serif text-lg font-medium leading-snug text-fg">{p.name}</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-base font-semibold text-fg">{vnd(p.price)}</span>
              {p.old && <span className="text-xs text-muted line-through">{vnd(p.old)}</span>}
            </div>
            <p className="text-xs text-muted">
              {p.reviews > 0 ? `★ ${p.rating.toFixed(1)} · ` : ""}
              {t("card.sold", { n: p.sold.toLocaleString(locale) })}
            </p>
          </div>
        </Link>

        <div className="pt-3 text-center">
          <button
            onClick={(e) => {
              add(p);
              flyToCart(e.currentTarget, p.image);
            }}
            className="border-b border-accent/60 pb-0.5 text-xs uppercase tracking-[0.2em] text-accent transition hover:border-accent hover:text-fg"
          >
            {t("card.add")}
          </button>
        </div>
      </div>

      {view && <Viewer3D p={p} onClose={() => setView(false)} />}
    </>
  );
}