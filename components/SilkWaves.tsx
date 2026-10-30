function wave(y: number, a: number, close: boolean) {
  const d = `M0,${y} C200,${y - a} 400,${y - a} 600,${y} S1000,${y + a} 1200,${y} S1600,${y - a} 1800,${y} S2200,${y + a} 2400,${y}`;
  return close ? d + " L2400,400 L0,400 Z" : d;
}

function Layer({ cls, y, a, op }: { cls: string; y: number; a: number; op: number }) {
  return (
    <svg
      className={`${cls} absolute left-0 top-0 h-full w-[200%]`}
      viewBox="0 0 2400 400"
      preserveAspectRatio="none"
      style={{ opacity: op }}
    >
      <defs>
        <linearGradient id={`fill${y}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6540" />
          <stop offset="0.12" stopColor="#1a1710" />
          <stop offset="0.5" stopColor="#070707" />
          <stop offset="1" stopColor="#000000" />
        </linearGradient>
        <linearGradient id={`line${y}`} x1="0" y1="0" x2="2400" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f2dfae" stopOpacity="0" />
          <stop offset="0.25" stopColor="#f2dfae" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#f2dfae" stopOpacity="0" />
          <stop offset="0.75" stopColor="#f2dfae" stopOpacity="0.95" />
          <stop offset="1" stopColor="#f2dfae" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={wave(y, a, true)} fill={`url(#fill${y})`} />
      <path d={wave(y, a, false)} fill="none" stroke={`url(#line${y})`} strokeWidth="3" style={{ filter: "blur(1.5px)" }} />
    </svg>
  );
}

export default function SilkWaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: "#050505" }}>
      <div
        className="sheen absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 70% at 78% -10%, rgba(255,232,180,0.5), rgba(255,232,180,0.07) 55%, transparent 75%)" }}
      />
      <Layer cls="silk-c" y={190} a={70} op={0.55} />
      <Layer cls="silk-b" y={235} a={85} op={0.8} />
      <Layer cls="silk-a" y={285} a={60} op={1} />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}