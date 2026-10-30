"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Drawers from "@/components/Drawers";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/data";
import { scentNotes } from "@/lib/scent";

export default function Scent() {
  const router = useRouter();
  const [items, setItems] = useState<Product[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => { fetch("/api/products").then((r) => r.json()).then(setItems); }, []);

  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length < 3 ? [...p, k] : p));

  const score = (p: Product) => (p.notes ?? []).filter((n) => picked.includes(n)).length;
  const results = items
    .filter((p) => p.cat === "perfume" && score(p) > 0)
    .sort((a, b) => score(b) - score(a));

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header q={q} setQ={setQ} onSearch={() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")} />
      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <Link href="/" className="text-sm text-muted hover:text-accent">← Về trang chủ</Link>

        {!done ? (
          <section className="space-y-8 text-center">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Tìm mùi hương của bạn</p>
              <h1 className="font-serif text-3xl font-medium md:text-4xl">Chọn tối đa 3 nốt hương bạn thích</h1>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {scentNotes.map((n) => {
                const on = picked.includes(n.key);
                return (
                  <button
                    key={n.key}
                    onClick={() => toggle(n.key)}
                    className={`flex h-44 flex-col items-center justify-center gap-3 rounded-xl border bg-gradient-to-b ${n.bg} transition hover:scale-[1.02] ${on ? "border-accent shadow-[0_0_24px_rgba(212,175,55,0.35)]" : "border-line"}`}
                  >
                    <span className="text-5xl">{n.emoji}</span>
                    <span className={`text-xs uppercase tracking-[0.2em] ${on ? "text-accent" : "text-muted"}`}>{n.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              disabled={picked.length === 0}
              onClick={() => setDone(true)}
              className="rounded-lg border border-accent px-10 py-3 text-sm uppercase tracking-[0.25em] text-accent transition hover:bg-accent hover:text-accent-fg disabled:opacity-30"
            >
              Tiếp theo
            </button>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-accent">Dành riêng cho bạn</p>
              <h1 className="font-serif text-3xl font-medium">Mùi hương hợp với bạn</h1>
              <p className="text-sm text-muted">
                Bạn đã chọn: {picked.map((k) => scentNotes.find((n) => n.key === k)?.label).join(", ")}
              </p>
            </div>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {results.map((p) => (
                  <div key={p.id} className="relative">
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-fg">
                      Hợp {Math.round((score(p) / picked.length) * 100)}%
                    </span>
                    <ProductCard p={p} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-10 text-center text-muted">
                Chưa có nước hoa nào được gắn nốt hương phù hợp. Hãy gắn nốt hương cho sản phẩm trong admin.
              </p>
            )}
            <div className="text-center">
              <button onClick={() => { setDone(false); setPicked([]); }} className="text-sm text-muted hover:text-accent">
                ↻ Làm lại
              </button>
            </div>
          </section>
        )}
      </main>
      <Drawers />
    </div>
  );
}