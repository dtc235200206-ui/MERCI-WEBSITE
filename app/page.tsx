"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Drawers from "@/components/Drawers";
import SilkWaves from "@/components/SilkWaves";
import Banner from "@/components/Banner";
import HomeChrome from "@/components/HomeChrome";
import BrandStrip from "@/components/BrandStrip";
import { Shimmer, BrandMarquee, Reveal, SkeletonGrid } from "@/components/Fx";
import { categories, Product, Brand } from "@/lib/data";
import { useLang } from "@/lib/lang";

function Title({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h2 className="font-serif text-3xl font-medium tracking-wide">{children}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
      {right}
    </div>
  );
}

const grid = "grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4";

// Mỗi banner dùng video (chạy tự động). Dòng "image" là ảnh chờ, có thể bỏ.
const banners = [
  { key: "bags", kicker: "banner.collection", video: "/banners/tui-xach.mp4", image: "/banners/tui-xach.jpg" },
  { key: "perfume", kicker: "banner.scent", video: "/banners/nuoc-hoa.mp4", image: "/banners/nuoc-hoa.jpg" },
  { key: "shoes", kicker: "banner.sneaker", video: "/banners/giay.mp4", image: "/banners/giay.jpg" },
];

export default function Home() {
  const { t } = useLang();
  const [items, setItems] = useState<Product[]>([]);
  const [brandList, setBrandList] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const heroVid = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        setItems(d);
        const s = new URLSearchParams(window.location.search).get("q");
        if (s) setQ(s);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((d) => setBrandList(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const v = heroVid.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.muted = true;
    v.play().catch(() => {});
  }, []);

  // "Cao Cấp" gồm sản phẩm gắn danh mục Cao Cấp và sản phẩm của các hãng trong mục Luxury Fashion Brands
  const luxNames = brandList.map((b) => b.name.trim().toLowerCase());
  const inCat = (p: Product, k: string) =>
    k === "all"
      ? true
      : k === "luxury"
        ? p.cat === "luxury" || luxNames.includes((p.brand || "").trim().toLowerCase())
        : p.cat === k;

  const key = q.toLowerCase();
  const list = items.filter((p) => inCat(p, cat) && (p.name + " " + p.brand).toLowerCase().includes(key));

  const countOf = (k: string) => items.filter((p) => inCat(p, k)).length;
  const goProducts = () => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  const brands = Array.from(new Set(items.map((p) => p.brand).filter(Boolean)));

  return (
    <div className="min-h-screen bg-bg text-fg">
      <HomeChrome />
      <Header q={q} setQ={setQ} />

      {/* HERO TRÀN MÀN HÌNH */}
      <section className="relative isolate h-screen min-h-[640px] overflow-hidden">
        <SilkWaves />
        <video
          ref={heroVid}
          src="/banners/hero.mp4"
          muted
          loop
          playsInline
          preload="auto"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/70" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="hero-in text-xs font-semibold uppercase tracking-[0.4em] text-[#d9bf8c]">{t("hero.kicker")}</p>
          <h1
            className="hero-in mt-5 font-serif text-6xl font-normal leading-[1.02] tracking-wide text-[#f6efe0] md:text-8xl"
            style={{ animationDelay: "200ms" }}
          >
            {t("hero.line1")}
            <br />
            <Shimmer>{t("hero.line2")}</Shimmer>
          </h1>
          <p className="hero-in mt-6 max-w-md text-[#f6efe0]/75" style={{ animationDelay: "400ms" }}>
            {t("hero.sub")}
          </p>
          <div className="hero-in mt-10 flex items-center gap-10 text-sm uppercase tracking-[0.2em]" style={{ animationDelay: "600ms" }}>
            <button
              onClick={goProducts}
              className="border-b border-[#d9bf8c] pb-1 text-[#f6efe0] transition hover:border-white hover:text-white"
            >
              {t("hero.explore")}
            </button>
            <Link href="/lua-chon" className="border-b border-transparent pb-1 text-[#d9bf8c] transition hover:border-[#d9bf8c]">
              {t("hero.choice")}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 h-12 w-px -translate-x-1/2 animate-pulse bg-gradient-to-b from-[#d9bf8c] to-transparent" />
      </section>

      <main className="mx-auto max-w-7xl space-y-20 px-4 pb-6 pt-14">
        {/* CAM KẾT */}
        <Reveal>
          <section className="flex flex-wrap justify-center gap-x-14 gap-y-3 border-b border-line pb-8 text-xs uppercase tracking-[0.22em] text-muted">
            {["trust.1", "trust.2", "trust.3", "trust.4"].map((k) => (
              <span key={k}>{t(k)}</span>
            ))}
          </section>
        </Reveal>

        {/* DẢI THƯƠNG HIỆU (giữ nguyên) */}
        <Reveal>
          <BrandMarquee brands={brands} />
        </Reveal>

        {/* LUXURY FASHION BRANDS */}
        {brandList.length > 0 && (
          <Reveal>
            <section>
              <Title>Luxury Fashion Brands</Title>
              <BrandStrip
                brands={brandList}
                onPick={(b) => {
                  setCat("all");
                  setQ(b.name);
                  goProducts();
                }}
              />
            </section>
          </Reveal>
        )}

        {/* DANH MỤC */}
        <Reveal>
          <section>
            <Title>{t("cat.title")}</Title>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {categories.map((c) => (
                <button
                  key={c.key}
                  onClick={() => {
                    setCat(c.key);
                    setQ("");
                    goProducts();
                  }}
                  className={`group relative aspect-[4/5] overflow-hidden border transition duration-700 ${
                    cat === c.key ? "border-accent" : "border-line hover:border-accent/50"
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-105"
                    style={{ backgroundImage: `url(/categories/${c.key}.jpg), linear-gradient(170deg, #1d1a13, #0c0c0d)` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
                  <div className="absolute inset-x-0 bottom-5 text-center">
                    <p className={`font-serif text-2xl ${cat === c.key ? "text-accent" : "text-[#f6efe0]"}`}>{t("cat." + c.key)}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#f6efe0]/60">{t("n.products", { n: countOf(c.key) })}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </Reveal>

        {/* BANNER VIDEO KIỂU DIOR */}
        {banners.map((b) => (
          <Banner
            key={b.key}
            image={b.image}
            video={b.video}
            kicker={t(b.kicker)}
            title={t("cat." + b.key)}
            cta={t("hero.explore")}
            onClick={() => {
              setCat(b.key);
              setQ("");
              goProducts();
            }}
          />
        ))}

        {/* TẤT CẢ SẢN PHẨM */}
        <section id="products" className="scroll-mt-24">
          <Title right={<span className="text-xs text-muted">{t("n.products", { n: list.length })}</span>}>
            {cat === "all" ? (key ? t("list.results") : t("list.suggest")) : t("cat." + cat)}
          </Title>
          {loading ? (
            <SkeletonGrid count={8} />
          ) : list.length === 0 ? (
            <p className="py-16 text-center text-muted">{t("list.none")}</p>
          ) : (
            <div className={grid}>
              {list.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 80}>
                  <ProductCard p={p} />
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CHÂN TRANG */}
      <footer className="mt-16 border-t border-[#d9bf8c]/20 bg-black/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center md:flex-row md:text-left">
          <div>
            <p className="font-serif text-2xl font-semibold tracking-[0.3em] text-[#d9bf8c]">MERCI</p>
            <p className="mt-1 text-xs text-muted">{t("foot.tagline")}</p>
          </div>
          <nav className="flex gap-6 text-xs uppercase tracking-[0.2em] text-muted">
            <Link href="/" className="hover:text-accent">{t("foot.home")}</Link>
            <Link href="/lua-chon" className="hover:text-accent">{t("foot.choice")}</Link>
            <button onClick={goProducts} className="uppercase tracking-[0.2em] hover:text-accent">{t("foot.products")}</button>
          </nav>
        </div>
      </footer>
      <Drawers />
    </div>
  );
}