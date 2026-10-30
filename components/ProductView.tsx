"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Drawers from "@/components/Drawers";
import ProductCard from "@/components/ProductCard";
import Thumb from "@/components/Thumb";
import Stars from "@/components/Stars";
import Reviews from "@/components/Reviews";
import Viewer3D, { Btn3D, has3D } from "@/components/Viewer3D";
import { Reveal } from "@/components/Fx";
import { Product, vnd } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/lang";

type Media = { type: "video" | "image"; src: string };

export default function ProductView({ id }: { id: string }) {
  const router = useRouter();
  const { add, setCartOpen } = useStore();
  const { t, locale } = useLang();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [view, setView] = useState(false);

  const load = () => fetch("/api/products").then((r) => r.json()).then(setItems);
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);
  useEffect(() => { setSel(0); setView(false); }, [id]);

  const p = items.find((x) => x.id === id);
  const others = items.filter((x) => x.id !== id);
  const rec = [
    ...others.filter((x) => p && x.cat === p.cat),
    ...others.filter((x) => !p || x.cat !== p.cat),
  ].slice(0, 10);

  const imgs = p ? (p.images?.length ? p.images : p.image ? [p.image] : []) : [];
  const media: Media[] = [
    ...(p?.video ? [{ type: "video" as const, src: p.video }] : []),
    ...imgs.map((src) => ({ type: "image" as const, src })),
  ];
  const idx = media.length ? Math.min(sel, media.length - 1) : 0;
  const cur = media[idx];
  const go = (d: number) => setSel((idx + d + media.length) % media.length);
  const off = p && p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const bg = cur ? (cur.type === "image" ? cur.src : imgs[0]) : "";

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header q={q} setQ={setQ} onSearch={() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")} />
      <main className="mx-auto max-w-5xl space-y-12 px-4 py-6">
        <Link href="/" className="text-sm text-muted hover:text-accent">{t("pv.back")}</Link>

        {loading ? (
          <p className="py-24 text-center text-muted">{t("pv.loading")}</p>
        ) : !p ? (
          <p className="py-24 text-center text-muted">{t("pv.notFound")}</p>
        ) : (
          <>
            <section className="mx-auto max-w-2xl space-y-5">
              <div className="relative mx-auto aspect-square w-full max-w-[600px] overflow-hidden rounded-2xl border border-line bg-black">
                {bg && (
                  <>
                    <img
                      src={bg}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </>
                )}

                {cur?.type === "video" ? (
                  <video
                    key={cur.src}
                    src={cur.src}
                    poster={imgs[0] || undefined}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="relative h-full w-full object-contain"
                  />
                ) : cur ? (
                  <img key={cur.src} src={cur.src} alt={p.name} className="relative h-full w-full object-contain" />
                ) : (
                  <Thumb p={p} className="relative h-full w-full" />
                )}

                {has3D(p) && <Btn3D onClick={() => setView(true)} className="absolute left-3 top-3 z-10" />}

                {media.length > 1 && (
                  <>
                    <button
                      onClick={() => go(-1)}
                      aria-label={t("pv.prev")}
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-black/60 text-xl text-accent transition hover:bg-accent hover:text-accent-fg"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => go(1)}
                      aria-label={t("pv.next")}
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-black/60 text-xl text-accent transition hover:bg-accent hover:text-accent-fg"
                    >
                      ›
                    </button>
                    <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/70 px-3 py-1 text-xs text-accent">
                      {idx + 1} / {media.length}
                    </span>
                  </>
                )}
              </div>

              {media.length > 1 && (
                <div className="mx-auto flex max-w-[600px] gap-2 overflow-x-auto pb-1">
                  {media.map((m, i) => (
                    <button
                      key={m.src + i}
                      onClick={() => setSel(i)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                        i === idx ? "border-accent shadow-[0_0_14px_rgba(217,191,140,0.4)]" : "border-line opacity-70 hover:opacity-100"
                      }`}
                    >
                      {m.type === "video" ? (
                        <>
                          {imgs[0] ? <img src={imgs[0]} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-black" />}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg text-accent">▶</span>
                        </>
                      ) : (
                        <img src={m.src} alt="" className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{p.brand}</p>
                <h1 className="font-serif text-3xl font-medium leading-tight md:text-4xl">{p.name}</h1>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-accent">{vnd(p.price)}</span>
                  {p.old && <span className="text-sm text-muted line-through">{vnd(p.old)}</span>}
                  {off > 0 && <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-fg">-{off}%</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => add(p)}
                  className="rounded-xl border border-accent py-3 font-semibold text-accent transition hover:bg-accent hover:text-accent-fg active:scale-95"
                >
                  {t("pv.add")}
                </button>
                <button
                  onClick={() => { add(p); setCartOpen(true); }}
                  className="rounded-xl bg-accent py-3 font-semibold text-accent-fg transition hover:opacity-85 active:scale-95"
                >
                  {t("pv.buy")}
                </button>
              </div>

              <div className="grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-card py-4 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{p.reviews > 0 ? p.rating.toFixed(1) : "–"}</div>
                  <Stars value={p.rating} />
                  <div className="text-xs text-muted">{t("pv.rating")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{p.reviews.toLocaleString(locale)}</div>
                  <div className="text-xs text-muted">{t("pv.reviews")}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-semibold">{p.sold.toLocaleString(locale)}</div>
                  <div className="text-xs text-muted">{t("pv.bought")}</div>
                </div>
              </div>
            </section>

            <Reveal>
              <Reviews productId={p.id} onChange={load} />
            </Reveal>

            {rec.length > 0 && (
              <Reveal>
                <section>
                  <div className="mb-5 flex items-center gap-4">
                    <h2 className="font-serif text-3xl font-medium tracking-wide">{t("pv.more")}</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {rec.map((x) => <ProductCard key={x.id} p={x} />)}
                  </div>
                </section>
              </Reveal>
            )}

            {view && <Viewer3D p={p} onClose={() => setView(false)} />}
          </>
        )}
      </main>
      <Drawers />
    </div>
  );
}