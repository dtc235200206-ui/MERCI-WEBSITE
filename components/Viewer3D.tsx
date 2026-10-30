"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType } from "react";
import { createPortal } from "react-dom";
import type { Product } from "@/lib/data";

export const has3D = (p: Product) => !!p.model || (p.spin?.length ?? 0) >= 2;

const css =
  "@keyframes v3-float{0%,100%{transform:translateY(6px)}50%{transform:translateY(-14px)}}" +
  "@keyframes v3-shadow{0%,100%{transform:translateX(-50%) scale(1);opacity:.3}50%{transform:translateX(-50%) scale(.7);opacity:.15}}";

const dots = "radial-gradient(rgba(120,110,90,.22) 1px, transparent 1px)";
const MV = "model-viewer" as unknown as ElementType;
const IDLE = 0.1;

/* Biểu tượng 3D nhỏ */
export function Btn3D({ onClick, className = "" }: { onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label="Xem 3D"
      title="Xem 3D"
      className={`flex h-9 w-9 items-center justify-center rounded-full border border-accent/60 bg-black/65 text-accent backdrop-blur transition hover:bg-accent hover:text-accent-fg active:scale-90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" />
        <path d="m3 7 9 5 9-5" />
        <path d="M12 12v10" />
      </svg>
    </button>
  );
}

/* Xoay 360 bằng chuỗi ảnh, có chuyển mờ giữa các khung và quán tính */
function SpinView({ frames }: { frames: string[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const st = useRef({ pos: 0, vel: IDLE, drag: false, lastX: 0, zoom: 1, tz: 1, imgs: [] as HTMLImageElement[] });
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const s = st.current;
    let count = 0;
    s.imgs = frames.map((src) => {
      const im = new Image();
      im.onload = () => { count++; setLoaded(count); };
      im.src = src;
      return im;
    });
    let raf = 0;
    const draw = () => {
      const c = cv.current;
      const w = wrap.current;
      if (c && w && s.imgs.length) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = w.clientWidth;
        const H = w.clientHeight;
        if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
          c.width = Math.round(W * dpr);
          c.height = Math.round(H * dpr);
        }
        const ctx = c.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, W, H);
          const n = s.imgs.length;
          if (!s.drag) {
            s.pos += s.vel;
            s.vel += (IDLE - s.vel) * 0.03;
          }
          s.zoom += (s.tz - s.zoom) * 0.12;
          const p = ((s.pos % n) + n) % n;
          const i = Math.floor(p);
          const f = p - i;
          const put = (im: HTMLImageElement, alpha: number) => {
            if (!im.complete || !im.naturalWidth || alpha <= 0) return;
            const k = Math.min(W / im.naturalWidth, H / im.naturalHeight) * 0.9 * s.zoom;
            const dw = im.naturalWidth * k;
            const dh = im.naturalHeight * k;
            ctx.globalAlpha = alpha;
            ctx.drawImage(im, (W - dw) / 2, (H - dh) / 2, dw, dh);
          };
          put(s.imgs[i], 1);
          put(s.imgs[(i + 1) % n], f);
          ctx.globalAlpha = 1;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frames]);

  const down = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    s.drag = true;
    s.lastX = e.clientX;
    s.vel = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = st.current;
    if (!s.drag) return;
    const w = wrap.current?.clientWidth || 600;
    const d = -((e.clientX - s.lastX) * s.imgs.length) / (w * 0.9);
    s.lastX = e.clientX;
    s.pos += d;
    s.vel = Math.max(-3, Math.min(3, s.vel * 0.4 + d * 0.6));
  };
  const up = () => { st.current.drag = false; };
  const wheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const s = st.current;
    s.tz = Math.max(1, Math.min(3, s.tz * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
  };

  return (
    <div
      ref={wrap}
      className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onWheel={wheel}
      onDoubleClick={() => { st.current.tz = 1; }}
    >
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      {loaded < frames.length && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
          Đang tải {loaded}/{frames.length}
        </p>
      )}
    </div>
  );
}

/* Xem mô hình 3D .glb */
function ModelView({ src }: { src: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let off = () => {};
    setReady(false);
    setErr(false);
    import("@google/model-viewer")
      .then(() => {
        const el = ref.current;
        if (!el) return;
        const ok = () => setReady(true);
        const bad = () => setErr(true);
        el.addEventListener("load", ok);
        el.addEventListener("error", bad);
        off = () => {
          el.removeEventListener("load", ok);
          el.removeEventListener("error", bad);
        };
      })
      .catch(() => setErr(true));
    return () => off();
  }, [src]);

  return (
    <div className="relative h-full w-full">
      <MV
        ref={ref}
        src={src}
        camera-controls
        auto-rotate
        rotation-per-second="24deg"
        auto-rotate-delay="2500"
        interaction-prompt="none"
        disable-pan
        touch-action="none"
        shadow-intensity="0"
        exposure="1.1"
        environment-image="neutral"
        interpolation-decay="70"
        style={{ width: "100%", height: "100%", background: "transparent", "--poster-color": "transparent" } as CSSProperties}
      />
      {!ready && !err && (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-500">Đang tải mô hình 3D...</p>
      )}
      {err && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-600">
          Không tải được mô hình 3D. Hãy kiểm tra lại file .glb trong admin.
        </p>
      )}
    </div>
  );
}

export default function Viewer3D({ p, onClose }: { p: Product; onClose: () => void }) {
  const hasModel = !!p.model;
  const hasSpin = (p.spin?.length ?? 0) >= 2;
  const [mode, setMode] = useState<"model" | "spin">(hasModel ? "model" : "spin");

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const tab = (on: boolean) =>
    `rounded-full px-4 py-1 text-xs transition ${on ? "bg-black text-[#d9bf8c]" : "text-black/60 hover:text-black"}`;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onClick={onClose}>
      <style>{css}</style>
      <div
        className="relative h-[min(88vh,740px)] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#d9bf8c]/50 bg-[#f6f3ec]"
        style={{ backgroundImage: dots, backgroundSize: "22px 22px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between gap-3 px-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8a7440]">{p.brand}</p>
            <p className="truncate font-serif text-lg text-neutral-900">{p.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasModel && hasSpin && (
              <div className="flex rounded-full border border-black/10 bg-white/80 p-0.5">
                <button onClick={() => setMode("model")} className={tab(mode === "model")}>Mô hình 3D</button>
                <button onClick={() => setMode("spin")} className={tab(mode === "spin")}>Ảnh xoay</button>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Đóng"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-lg text-[#d9bf8c] transition hover:opacity-80"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-14 top-16">
          <div
            className={`absolute inset-x-0 top-0 bottom-10 ${mode === "spin" ? "mix-blend-multiply" : ""}`}
            style={{ animation: "v3-float 5s ease-in-out infinite" }}
          >
            {mode === "model" && hasModel ? <ModelView src={p.model!} /> : <SpinView frames={p.spin ?? []} />}
          </div>
          <div
            className="pointer-events-none absolute bottom-3 left-1/2 h-5 w-52 rounded-full bg-black blur-xl"
            style={{ animation: "v3-shadow 5s ease-in-out infinite" }}
          />
        </div>

        <p className="absolute inset-x-0 bottom-4 z-20 text-center text-xs text-neutral-500">
          Kéo để xoay 360° · Cuộn để phóng to · Nhấn Esc để đóng
        </p>
      </div>
    </div>,
    document.body
  );
}