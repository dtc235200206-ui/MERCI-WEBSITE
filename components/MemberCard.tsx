"use client";
import { useId, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { CARD_SRC, MX, TIER_NAMES, TIER_STYLE, Tier } from "@/lib/membership";
import { useLang } from "@/lib/lang";

// Bảng mã Code 39: n = vạch hẹp, w = vạch rộng (9 phần tử: vạch, trống, vạch...)
const P: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn", "4": "nnnwwnnnw",
  "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw", "8": "wnnwnnwnn", "9": "nnwwnnwnn",
  A: "wnnnnwnnw", B: "nnwnnwnnw", C: "wnwnnwnnn", D: "nnnnwwnnw", E: "wnnnwwnnn",
  F: "nnwnwwnnn", G: "nnnnnwwnw", H: "wnnnnwwnn", I: "nnwnnwwnn", J: "nnnnwwwnn",
  K: "wnnnnnnww", L: "nnwnnnnww", M: "wnwnnnnwn", N: "nnnnwnnww", O: "wnnnwnnwn",
  P: "nnwnwnnwn", Q: "nnnnnnwww", R: "wnnnnnwwn", S: "nnwnnnwwn", T: "nnnnwnwwn",
  U: "wwnnnnnnw", V: "nwwnnnnnw", W: "wwwnnnnnn", X: "nwnnwnnnw", Y: "wwnnwnnnn",
  Z: "nwwnwnnnn", "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "*": "nwnnwnwnn",
};

function code39(text: string) {
  const s = `*${text.toUpperCase().replace(/[^0-9A-Z\-. ]/g, "")}*`;
  const rects: [number, number][] = [];
  let x = 10;
  for (const ch of s) {
    const p = P[ch];
    for (let i = 0; i < 9; i++) {
      const w = p[i] === "w" ? 3 : 1;
      if (i % 2 === 0) rects.push([x, w]);
      x += w;
    }
    x += 1;
  }
  return { rects, width: x + 9 };
}

function Barcode({ text }: { text: string }) {
  const { rects, width } = code39(text);
  return (
    <svg viewBox={`0 0 ${width} 30`} preserveAspectRatio="none" className="block h-full w-full" shapeRendering="crispEdges" role="img" aria-label={text}>
      {rects.map(([x, w], i) => (
        <rect key={i} x={x} y={0} width={w} height={30} fill="#1a1712" />
      ))}
    </svg>
  );
}

// Nhãn trên mặt sau theo ngôn ngữ
const L: Record<Lang, { id: string; holder: string; issued: string; mem: string }> = {
  vi: { id: "SỐ THẺ", holder: "CHỦ THẺ", issued: "NGÀY PHÁT HÀNH", mem: "MEMBERSHIP" },
  en: { id: "CARD NO.", holder: "CARDHOLDER", issued: "DATE OF ISSUE", mem: "MEMBERSHIP" },
  zh: { id: "卡号", holder: "持卡人", issued: "发卡日期", mem: "MEMBERSHIP" },
  fr: { id: "N° DE CARTE", holder: "TITULAIRE", issued: "DATE D'ÉMISSION", mem: "MEMBERSHIP" },
};

const css = `
.mc-scene{width:100%;max-width:520px;margin:0 auto;container-type:inline-size;perspective:1400px}
.mc-wrap{animation:mc-in .9s cubic-bezier(.2,.8,.2,1) both}
.mc-float{perspective:1400px;animation:mc-fl 7s ease-in-out infinite}
.mc-scene:hover .mc-float{animation-play-state:paused}
.mc-tilt{--rx:0deg;--ry:0deg;--gx:50%;--gy:30%;transform-style:preserve-3d;transform:rotateX(var(--rx)) rotateY(var(--ry));transition:transform .6s cubic-bezier(.2,.8,.2,1)}
.mc-tilt[data-hover="1"]{transition:transform .08s linear}
.mc-flip{position:relative;aspect-ratio:1.6;transform-style:preserve-3d;transition:transform 1s cubic-bezier(.3,.7,.2,1);cursor:pointer;outline:none}
.mc-flip[data-flipped="true"]{transform:rotateY(180deg)}
.mc-flip:focus-visible{outline:2px solid #d9bf8c;outline-offset:6px;border-radius:22px}
.mc-face{position:absolute;inset:0;border-radius:6cqw;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 40px 70px -35px #000,0 0 60px -14px var(--glow)}
.mc-back{transform:rotateY(180deg)}
.mc-glare{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .4s;mix-blend-mode:screen;background:radial-gradient(circle at var(--gx) var(--gy),rgba(255,255,255,.55),rgba(255,255,255,.14) 28%,transparent 55%)}
.mc-tilt[data-hover="1"] .mc-glare{opacity:1}
.mc-sweep{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.mc-sweep::before{content:"";position:absolute;top:-30%;bottom:-30%;left:0;width:30%;mix-blend-mode:screen;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:translateX(-200%) skewX(-20deg);animation:mc-sw 6s ease-in-out infinite}
.mc-sp{position:absolute;width:3cqw;height:3cqw;opacity:0;pointer-events:none;background:radial-gradient(circle,#fff 0 12%,transparent 30%),linear-gradient(90deg,transparent 44%,rgba(255,255,255,.95) 50%,transparent 56%),linear-gradient(0deg,transparent 44%,rgba(255,255,255,.95) 50%,transparent 56%);animation:mc-tw 3.2s ease-in-out infinite}
.mc-foil{background:linear-gradient(100deg,#b9a06a 20%,#fff3c9 40%,#d9bf8c 50%,#b9a06a 80%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:mc-sh 4.5s linear infinite;filter:drop-shadow(0 .25cqw .2cqw rgba(0,0,0,.6)) drop-shadow(0 0 1.4cqw rgba(217,191,140,.5))}
@keyframes mc-in{from{opacity:0;transform:rotateY(-80deg) scale(.88)}to{opacity:1;transform:none}}
@keyframes mc-fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes mc-sw{0%{transform:translateX(-200%) skewX(-20deg)}55%,100%{transform:translateX(480%) skewX(-20deg)}}
@keyframes mc-holo{to{transform:rotate(360deg)}}
@keyframes mc-tw{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:1;transform:scale(1.25)}}
@keyframes mc-sh{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.mc-wrap,.mc-float,.mc-sweep::before,.mc-sp,.mc-holo,.mc-foil{animation:none!important}}
`;

export default function MemberCard({ tier, holder, number, since }: { tier: Tier; holder: string; number: string; since: string }) {
  const { lang } = useLang();
  const uid = useId().replace(/:/g, "");
  const mx = (k: string) => MX[lang][k] ?? MX.vi[k] ?? k;
  const lb = L[lang];
  const s = TIER_STYLE[tier];
  const name = TIER_NAMES[lang][tier];
  const [flipped, setFlipped] = useState(false);
  const [imgOk, setImgOk] = useState(true);
  const tilt = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = tilt.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * 16).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * 20).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.dataset.hover = "1";
  }

  function leave() {
    const el = tilt.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.hover;
  }

  const toggle = () => setFlipped((f) => !f);
  const label = { fontSize: "1.4cqw", letterSpacing: ".3em", color: s.soft } as const;
  const value = { marginTop: ".7cqw", fontSize: "2.5cqw", letterSpacing: ".16em", color: "#f1ead9" } as const;

  return (
    <div className="mc-scene" style={{ ["--glow" as string]: s.glow } as React.CSSProperties}>
      <style>{css}</style>
      <div className="mc-wrap">
        <div className="mc-float">
          <div ref={tilt} className="mc-tilt" onPointerMove={move} onPointerLeave={leave}>
            <div
              className="mc-flip"
              data-flipped={flipped}
              role="button"
              tabIndex={0}
              aria-pressed={flipped}
              aria-label={`${name} · MERCI`}
              onClick={toggle}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }}
            >
              {/* MẶT TRƯỚC */}
              <div className="mc-face">
                {imgOk ? (
                  <img src={CARD_SRC[tier]} alt="" draggable={false} onError={() => setImgOk(false)} className="absolute inset-0 h-full w-full select-none object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: s.front }}>
                    <span className="font-serif font-semibold text-white" style={{ fontSize: "11cqw", letterSpacing: ".12em" }}>MERCI</span>
                    <span className="text-white/80" style={{ fontSize: "2.6cqw", letterSpacing: ".4em" }}>{name.toUpperCase()}</span>
                  </div>
                )}
                <div className="mc-glare" />
                <div className="mc-sweep" />
                <i className="mc-sp" style={{ top: "13%", right: "9%" }} />
                <i className="mc-sp" style={{ bottom: "26%", right: "34%", animationDelay: "-1.6s" }} />
                <i className="mc-sp" style={{ top: "46%", left: "7%", animationDelay: "-2.4s" }} />
              </div>

              {/* MẶT SAU */}
              <div className="mc-face mc-back">
                {/* nền lấy từ mặt trước, làm mờ và tối đi để đúng màu từng hạng */}
                {imgOk ? (
                  <img src={CARD_SRC[tier]} alt="" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover" style={{ filter: "blur(14px) brightness(.38) saturate(1.3)", transform: "scale(1.25)" }} />
                ) : (
                  <div className="absolute inset-0" style={{ background: s.front, filter: "brightness(.4)" }} />
                )}
                <div className="absolute inset-0" style={{ background: `radial-gradient(90% 70% at 50% 0%, ${s.soft}38, transparent 62%), linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,.55))` }} />
                <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(115deg, rgba(255,255,255,.03) 0 1px, transparent 1px 5px), repeating-radial-gradient(circle at 50% 125%, ${s.soft}18 0 1px, transparent 1px 7px)` }} />

                {/* ruy-băng ánh kim, ngôi sao góc, hạt sáng */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                  <defs>
                    <linearGradient id={`rs${uid}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor={s.soft} stopOpacity=".1" />
                      <stop offset=".5" stopColor="#ffffff" stopOpacity=".9" />
                      <stop offset="1" stopColor={s.soft} stopOpacity=".15" />
                    </linearGradient>
                    <linearGradient id={`rf${uid}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor={s.soft} stopOpacity=".32" />
                      <stop offset="1" stopColor={s.soft} stopOpacity=".04" />
                    </linearGradient>
                    <linearGradient id={`cg${uid}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fff3c9" />
                      <stop offset=".5" stopColor="#d9bf8c" />
                      <stop offset="1" stopColor="#8a6f3d" />
                    </linearGradient>
                  </defs>
                  <path d="M-4 34 C 14 22, 28 10, 56 -6 L 66 -6 C 38 10, 26 26, -4 46 Z" fill={`url(#rf${uid})`} />
                  <path d="M-4 34 C 14 22, 28 10, 56 -6" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".45" />
                  <path d="M-4 46 C 26 26, 38 10, 66 -6" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".3" opacity=".7" />
                  <path d="M164 62 C 140 72, 126 92, 96 106 L 108 106 C 134 94, 150 82, 164 76 Z" fill={`url(#rf${uid})`} />
                  <path d="M164 62 C 140 72, 126 92, 96 106" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".45" />
                  <path d="M164 76 C 150 82, 134 94, 108 106" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".3" opacity=".7" />
                  <path d="M-4 90 C 26 80, 52 102, 88 94 S 136 86, 164 94" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".4" />
                  <path d="M-4 95 C 26 85, 52 107, 88 99 S 136 91, 164 99" fill="none" stroke={`url(#rs${uid})`} strokeWidth=".25" opacity=".6" />
                  {[[12, 12], [148, 12], [12, 88], [148, 88]].map(([x, y]) => (
                    <path key={`${x}-${y}`} d="M0 -3 L.8 -.8 L3 0 L.8 .8 L0 3 L-.8 .8 L-3 0 L-.8 -.8 Z" transform={`translate(${x} ${y})`} fill={s.soft} opacity=".95" />
                  ))}
                  {[[30, 70], [44, 20], [120, 28], [136, 66], [96, 12], [22, 50], [70, 58]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r=".5" fill="#fff" opacity=".7" />
                  ))}
                </svg>

                {/* viền kép */}
                <div className="absolute" style={{ inset: "2cqw", borderRadius: "4.4cqw", border: `1px solid ${s.soft}cc` }} />
                <div className="absolute" style={{ inset: "3.2cqw", borderRadius: "3.2cqw", border: `1px solid ${s.soft}55` }} />

                {/* vương miện + chữ MERCI */}
                <svg className="absolute" style={{ left: "50%", top: "5cqw", width: "8.5cqw", transform: "translateX(-50%)", filter: "drop-shadow(0 0 1cqw rgba(217,191,140,.55))" }} viewBox="0 0 28 20" aria-hidden="true">
                  <path d="M2 15 L4.5 4 L10 10 L14 1.5 L18 10 L23.5 4 L26 15 Z" fill={`url(#cg${uid})`} />
                  <path d="M3 16.5 H25 V19 H3 Z" fill={`url(#cg${uid})`} />
                  <circle cx="4.5" cy="3.4" r="1.2" fill="#fff3c9" />
                  <circle cx="14" cy="1.1" r="1.3" fill="#fff3c9" />
                  <circle cx="23.5" cy="3.4" r="1.2" fill="#fff3c9" />
                </svg>
                <div className="absolute inset-x-0 text-center" style={{ top: "10.4cqw" }}>
                  <div className="mc-foil font-serif font-semibold" style={{ fontSize: "7cqw", letterSpacing: ".3em", paddingLeft: ".3em", lineHeight: 1 }}>MERCI</div>
                </div>
                <div className="absolute inset-x-0 flex items-center justify-center" style={{ top: "18.8cqw", gap: "2cqw" }}>
                  <i style={{ width: "10cqw", height: 1, background: `linear-gradient(90deg, transparent, ${s.soft})` }} />
                  <span style={{ fontSize: "1.8cqw", letterSpacing: ".42em", paddingLeft: ".42em", color: "#f1e6c8", whiteSpace: "nowrap" }}>
                    <span style={{ color: s.soft }}>{name.toUpperCase()}</span> {lb.mem}
                  </span>
                  <i style={{ width: "10cqw", height: 1, background: `linear-gradient(270deg, transparent, ${s.soft})` }} />
                </div>

                {/* số thẻ + hologram */}
                <div className="absolute" style={{ left: "8cqw", top: "24.4cqw" }}>
                  <div style={label}>{lb.id}</div>
                  <div style={{ marginTop: ".9cqw", fontSize: "5.4cqw", letterSpacing: ".14em", lineHeight: 1, color: "#f6ecd2", textShadow: `0 .15cqw 0 rgba(0,0,0,.75), 0 0 1.8cqw ${s.soft}77` }}>{number}</div>
                </div>
                <div className="absolute overflow-hidden rounded-full" style={{ right: "8cqw", top: "24.6cqw", width: "10.5cqw", height: "10.5cqw", boxShadow: "0 0 0 .25cqw rgba(255,255,255,.4), 0 0 2cqw rgba(255,255,255,.25)" }}>
                  <div className="absolute inset-[-30%]" style={{ background: "conic-gradient(from 0deg,#ff6ec7,#ffd86e,#6effb0,#6ec8ff,#b07cff,#ff6ec7)", animation: "mc-holo 9s linear infinite" }} />
                  <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 28%, rgba(255,255,255,.9), transparent 55%)" }} />
                  <div className="absolute rounded-full" style={{ inset: "22%", border: "1px solid rgba(255,255,255,.55)" }} />
                </div>

                {/* chủ thẻ + ngày phát hành */}
                <div className="absolute flex justify-between" style={{ left: "8cqw", right: "8cqw", top: "36.2cqw" }}>
                  <div>
                    <div style={label}>{lb.holder}</div>
                    <div style={value}>{holder}</div>
                  </div>
                  <div className="text-right">
                    <div style={label}>{lb.issued}</div>
                    <div style={value}>{since}</div>
                  </div>
                </div>

                {/* mã vạch trên tấm bạc */}
                <div
                  className="absolute flex flex-col"
                  style={{
                    left: "8cqw",
                    right: "8cqw",
                    top: "44.6cqw",
                    height: "10.8cqw",
                    borderRadius: "1.4cqw",
                    padding: "1.3cqw 2.4cqw .9cqw",
                    background: "linear-gradient(180deg,#f8f2e3,#d9d0bb 55%,#efe7d3)",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.55), 0 .8cqw 1.8cqw rgba(0,0,0,.5)",
                  }}
                >
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <Barcode text={number} />
                  </div>
                  <div style={{ marginTop: ".6cqw", textAlign: "center", fontSize: "1.6cqw", letterSpacing: ".5em", paddingLeft: ".5em", color: "#2a241a" }}>{number}</div>
                </div>
                <div className="absolute inset-x-0 text-center" style={{ top: "56.6cqw", fontSize: "1.25cqw", letterSpacing: ".14em", color: "rgba(240,232,214,.55)" }}>{mx("back.foot")}</div>

                <div className="mc-glare" />
                <div className="mc-sweep" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}