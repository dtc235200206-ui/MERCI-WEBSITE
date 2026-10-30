"use client";
import { useEffect, useRef } from "react";
import { useReveal } from "@/components/useReveal";

export default function Banner({
  image,
  video,
  kicker,
  title,
  cta,
  onClick,
}: {
  image?: string;
  video?: string;
  kicker?: string;
  title: string;
  cta?: string;
  onClick?: () => void;
}) {
  const box = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  useReveal(box, 0.25);

  // Hiệu ứng ảnh/video trôi chậm hơn khi cuộn
  useEffect(() => {
    const el = box.current;
    const ly = layer.current;
    if (!el || !ly) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      ly.style.transform = `translate3d(0, ${p * -50}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Video chỉ chạy khi banner đang nằm trong màn hình
  useEffect(() => {
    const el = box.current;
    const v = vid.current;
    if (!el || !v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bgImage = image ? `url(${image}), ` : "";

  return (
    <section ref={box} className="banner relative isolate flex h-[70vh] min-h-[440px] items-center justify-center overflow-hidden border border-[#d9bf8c]/20 text-center">
      <div ref={layer} className="absolute inset-x-0 -top-[14%] h-[128%] will-change-transform">
        <div
          className="banner-img absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `${bgImage}radial-gradient(ellipse at 70% 0%, rgba(255,232,180,0.28), transparent 60%), linear-gradient(160deg, #1d1a13, #0a0a0b)`,
          }}
        >
          {video && (
            <video
              ref={vid}
              src={video}
              poster={image}
              muted
              loop
              playsInline
              preload="metadata"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
      <div className="relative z-10 px-6">
        {kicker && (
          <p className="rise text-xs font-semibold uppercase tracking-[0.4em] text-[#d9bf8c]">{kicker}</p>
        )}
        <h2 className="rise mt-4 font-serif text-6xl font-normal tracking-wide text-[#f6efe0] md:text-8xl" style={{ transitionDelay: "200ms" }}>
          {title}
        </h2>
        {cta && (
          <button
            onClick={onClick}
            className="rise mt-8 border-b border-[#d9bf8c] pb-1 text-sm uppercase tracking-[0.2em] text-[#f6efe0] transition hover:border-white hover:text-white"
            style={{ transitionDelay: "400ms" }}
          >
            {cta}
          </button>
        )}
      </div>
    </section>
  );
}