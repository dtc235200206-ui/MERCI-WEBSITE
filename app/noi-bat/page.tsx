"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Drawers from "@/components/Drawers";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/data";

const tabs = [
  { key: "best", label: "Bán chạy nhất", desc: "Những món được mua nhiều nhất" },
  { key: "sale", label: "Đang giảm giá", desc: "Ưu đãi tốt nhất dành cho bạn" },
  { key: "new", label: "Mới về", desc: "Vừa cập nhật vào kho" },
];

const pct = (p: Product) => (p.old ? 1 - p.price / p.old : 0);

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab = tabs.some((t) => t.key === raw) ? (raw as string) : "best";
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const list =
    tab === "best"
      ? [...items].sort((a, b) => b.sold - a.sold).slice(0, 20)
      : tab === "sale"
      ? items.filter((p) => p.old && p.old > p.price).sort((a, b) => pct(b) - pct(a))
      : items.slice(0, 20);

  const cur = tabs.find((t) => t.key === tab)!;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <Header q={q} setQ={setQ} onSearch={() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")} />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        <Link href="/" className="text-sm text-muted hover:text-accent">← Về trang chủ</Link>

        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">MERCI</p>
          <h1 className="font-serif text-4xl font-medium">{cur.label}</h1>
          <p className="text-sm text-muted">{cur.desc}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <Link
              key={t.key}
              href={`/noi-bat?tab=${t.key}`}
              className={`rounded-full border px-5 py-2 text-sm transition ${
                tab === t.key ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-accent/50"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {loading ? (
          <p className="py-16 text-center text-muted">Đang tải sản phẩm...</p>
        ) : list.length === 0 ? (
          <p className="py-16 text-center text-muted">
            {tab === "sale" ? "Hiện chưa có sản phẩm nào giảm giá." : "Chưa có sản phẩm nào."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Drawers />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  );
}