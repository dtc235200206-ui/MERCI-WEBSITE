"use client";
import { useEffect, useRef, useState } from "react";

const css =
  "@keyframes fx-shimmer{to{background-position:-200% 0}}" +
  "@keyframes fx-marquee{to{transform:translateX(-50%)}}" +
  ".fx-mq:hover .fx-track>div{animation-play-state:paused}";

/* Chữ ánh vàng chạy ngang */
export function Shimmer({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{css}</style>
      <span
        style={{
          backgroundImage: "linear-gradient(100deg,#b9a06a 20%,#f6e7b8 40%,#d9bf8c 50%,#b9a06a 80%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          animation: "fx-shimmer 4s linear infinite",
        }}
      >
        {children}
      </span>
    </>
  );
}

/* Dải thương hiệu 2 hàng chạy ngược chiều */
export function BrandMarquee({ brands }: { brands: string[] }) {
  const base = brands.length ? brands : ["NIKE", "DIOR", "CHANEL", "JORDAN", "GUCCI", "TOM FORD"];
  let row = [...base];
  while (row.length < 8) row = [...row, ...base];
  const loop = [...row, ...row];
  const mask = "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)";

  const item = (b: string, i: number, outline: boolean) => (
    <span key={i} className="inline-flex items-center">
      <span
        className={`mx-7 font-serif text-2xl tracking-[0.25em] ${outline ? "" : "text-[#d9bf8c]"}`}
        style={outline ? { color: "transparent", WebkitTextStroke: "1px rgba(217,191,140,.55)" } : undefined}
      >
        {b.toUpperCase()}
      </span>
      <span className="text-[#d9bf8c]/50">✦</span>
    </span>
  );

  return (
    <div
      className="fx-mq relative space-y-1 overflow-hidden border-y border-[#d9bf8c]/25 py-4"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
      aria-hidden="true"
    >
      <style>{css}</style>
      <div className="fx-track whitespace-nowrap">
        <div className="inline-block" style={{ animation: "fx-marquee 40s linear infinite" }}>
          {loop.map((b, i) => item(b, i, false))}
        </div>
      </div>
      <div className="fx-track whitespace-nowrap">
        <div className="inline-block" style={{ animation: "fx-marquee 55s linear infinite reverse" }}>
          {[...loop].reverse().map((b, i) => item(b, i, true))}
        </div>
      </div>
    </div>
  );
}

/* Hiện dần khi cuộn tới */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(28px)",
        transition: `opacity .7s ease ${delay}ms, transform .7s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* Khung xương sáng lúc tải */
const Sk = ({ className = "" }: { className?: string }) => (
  <div
    className={`rounded ${className}`}
    style={{
      backgroundImage: "linear-gradient(100deg, rgba(217,191,140,.06) 30%, rgba(217,191,140,.22) 50%, rgba(217,191,140,.06) 70%)",
      backgroundSize: "200% 100%",
      animation: "fx-shimmer 1.4s linear infinite",
    }}
  />
);

export function SkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <>
      <style>{css}</style>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-accent/20 bg-card">
            <Sk className="h-56 w-full rounded-none" />
            <div className="space-y-2 p-4">
              <Sk className="h-3 w-1/3" />
              <Sk className="h-4 w-4/5" />
              <Sk className="h-4 w-3/5" />
              <Sk className="mt-3 h-6 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* Bay vào giỏ */
export function flyToCart(from: HTMLElement, src?: string) {
  const target = document.querySelector("[data-cart-target]") as HTMLElement | null;
  if (!target) return;
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);

  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;z-index:9999;width:56px;height:56px;border-radius:50%;pointer-events:none;" +
    "border:1.5px solid #d9bf8c;box-shadow:0 0 20px rgba(217,191,140,.6);background:#d9bf8c;" +
    `left:${a.left + a.width / 2 - 28}px;top:${a.top + a.height / 2 - 28}px;`;
  if (src) {
    el.style.backgroundImage = `url(${JSON.stringify(src)})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
  }
  document.body.appendChild(el);

  const anim = el.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px,${dy * 0.5 - 90}px) scale(.85)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px,${dy}px) scale(.15)`, opacity: 0.3 },
    ],
    { duration: 800, easing: "cubic-bezier(.45,0,.6,1)" }
  );
  anim.onfinish = () => {
    el.remove();
    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
      { duration: 350, easing: "ease-out" }
    );
  };
}