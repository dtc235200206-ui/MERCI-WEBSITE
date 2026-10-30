"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Drawers from "@/components/Drawers";
import ProductCard from "@/components/ProductCard";
import { categories, Product } from "@/lib/data";
import { choiceGroups } from "@/lib/choices";

export default function Choose() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("");
  const [type, setType] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
    const c = new URLSearchParams(window.location.search).get("cat");
    if (c && choiceGroups[c]) setCat(c);
  }, []);

  const group = cat ? choiceGroups[cat] : null;
  const catInfo = categories.find((c) => c.key === cat);
  const multi = cat === "perfume"; // nước hoa: chọn nhiều nốt hương
  const inCat = items.filter((p) => p.cat === cat);
  const countType = (k: string) => inCat.filter((p) => (p.notes ?? []).includes(k)).length;

  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length < 3 ? [...p, k] : p));
  const score = (p: Product) => (p.notes ?? []).filter((n) => picked.includes(n)).length;

  const results =
    type === "match"
      ? inCat.filter((p) => score(p) > 0).sort((a, b) => score(b) - score(a))
      : type === "all"
      ? inCat
      : inCat.filter((p) => (p.notes ?? []).includes(type));

  const typeLabel =
    type === "match" ? "Mùi hương hợp với bạn" : type === "all" ? "Tất cả" : group?.options.find((o) => o.key === type)?.label;

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm transition ${on ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-accent/50"}`;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header q={q} setQ={setQ} onSearch={() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")} />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {!group ? (
          <Link href="/" className="text-sm text-muted hover:text-accent">← Về trang chủ</Link>
        ) : type ? (
          <button onClick={() => setType("")} className="text-sm text-muted hover:text-accent">← {catInfo?.label}</button>
        ) : (
          <button onClick={() => { setCat(""); setPicked([]); }} className="text-sm text-muted hover:text-accent">← Tất cả danh mục</button>
        )}

        {/* TẦNG 1: DANH MỤC */}
        {!group && (
          <section className="space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Lựa chọn</p>
              <h1 className="font-serif text-3xl font-medium md:text-4xl">Bạn đang tìm gì hôm nay?</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {categories.filter((c) => c.key !== "all").map((c) => (
                <button
                  key={c.key}
                  onClick={() => { setCat(c.key); setType(""); setPicked([]); }}
                  className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-accent/25 bg-card transition hover:-translate-y-1 hover:border-accent hover:shadow-[0_0_24px_rgba(217,191,140,0.3)]"
                >
                  <span className="text-5xl">{c.emoji}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-fg">{c.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* TẦNG 2: CÁC LOẠI TRONG DANH MỤC */}
        {group && !type && (
          <section className="space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Lựa chọn</p>
              <h1 className="font-serif text-3xl font-medium md:text-4xl">{catInfo?.label}</h1>
              <p className="text-sm text-muted">
                {multi ? group.title : `Chọn ${group.adminLabel.toLowerCase()} bạn quan tâm`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <button
                onClick={() => setType("all")}
                className="flex h-44 flex-col items-center justify-center gap-3 rounded-xl border border-accent/40 bg-card transition hover:-translate-y-1 hover:border-accent"
              >
                <span className="text-5xl">{catInfo?.emoji}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-accent">Tất cả</span>
                <span className="text-[11px] text-muted">{inCat.length} sản phẩm</span>
              </button>
              {group.options.map((n) => {
                const on = multi && picked.includes(n.key);
                return (
                  <button
                    key={n.key}
                    onClick={() => (multi ? toggle(n.key) : setType(n.key))}
                    className={`flex h-44 flex-col items-center justify-center gap-3 rounded-xl border bg-gradient-to-b ${n.bg} transition hover:-translate-y-1 ${
                      on ? "border-accent shadow-[0_0_24px_rgba(212,175,55,0.35)]" : "border-line hover:border-accent"
                    }`}
                  >
                    <span className="text-5xl">{n.emoji}</span>
                    <span className={`text-xs uppercase tracking-[0.2em] ${on ? "text-accent" : "text-fg"}`}>{n.label}</span>
                    <span className="text-[11px] text-muted">{countType(n.key)} sản phẩm</span>
                  </button>
                );
              })}
            </div>
            {multi && (
              <button
                disabled={picked.length === 0}
                onClick={() => setType("match")}
                className="rounded-lg border border-accent px-10 py-3 text-sm uppercase tracking-[0.25em] text-accent transition hover:bg-accent hover:text-accent-fg disabled:opacity-30"
              >
                Tiếp theo
              </button>
            )}
          </section>
        )}

        {/* TẦNG 3: SẢN PHẨM */}
        {group && type && (
          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">{catInfo?.label}</p>
              <h1 className="font-serif text-3xl font-medium md:text-4xl">{typeLabel}</h1>
              {type === "match" && (
                <p className="text-sm text-muted">
                  Bạn đã chọn: {picked.map((k) => group.options.find((n) => n.key === k)?.label).join(", ")}
                </p>
              )}
            </div>

            {type === "match" ? (
              <div className="text-center">
                <button onClick={() => { setType(""); setPicked([]); }} className="text-sm text-muted hover:text-accent">↻ Chọn lại</button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={() => setType("all")} className={chip(type === "all")}>Tất cả</button>
                {group.options.map((n) => (
                  <button key={n.key} onClick={() => setType(n.key)} className={chip(type === n.key)}>
                    {n.emoji} {n.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <p className="py-16 text-center text-muted">Đang tải sản phẩm...</p>
            ) : results.length === 0 ? (
              <p className="py-16 text-center text-muted">
                {type === "match" ? "Chưa có sản phẩm nào được gắn đúng nốt hương này. Hãy gắn nốt hương cho sản phẩm trong admin." : "Chưa có sản phẩm nào trong mục này."}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {results.map((p) => (
                  <div key={p.id} className="relative">
                    {type === "match" && (
                      <span className="absolute right-2 top-2 z-10 rounded-full border border-accent/50 bg-black/70 px-2.5 py-0.5 text-xs font-bold text-accent">
                        Hợp {Math.round((score(p) / picked.length) * 100)}%
                      </span>
                    )}
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Drawers />
    </div>
  );
}