"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Header from "@/components/Header";
import Drawers from "@/components/Drawers";
import LangPicker from "@/components/LangPicker";
import ProductCard from "@/components/ProductCard";
import SilkWaves from "@/components/SilkWaves";
import MemberCard from "@/components/MemberCard";
import { Reveal, Shimmer } from "@/components/Fx";
import { useLang } from "@/lib/lang";
import { useStore } from "@/lib/store";
import { vnd, Product } from "@/lib/data";
import type { Lang } from "@/lib/i18n";
import { TIERS, TIER_MIN, TIER_MAX, TIER_STYLE, TIER_NAMES, CARD_SRC, BENEFITS, MX, resolveTier, nextTier, Tier } from "@/lib/membership";

type Me = {
  id: string;
  email: string;
  name: string;
  image: string;
  phone: string;
  birthday: string;
  spend: number;
  points: number;
  vouchers: { code: string; title: string; desc: string }[];
  tierOverride?: string;
  createdAt: string;
};
type Tab = "overview" | "profile" | "orders" | "vouchers" | "card" | "settings";

const X: Record<Lang, Record<string, string>> = {
  vi: { from: "Từ hạng {tier}", quick: "Truy cập nhanh", benefits: "Quyền lợi theo hạng", done: "hoàn thành" },
  en: { from: "From {tier}", quick: "Quick access", benefits: "Privileges by tier", done: "complete" },
  zh: { from: "{tier}起", quick: "快捷入口", benefits: "等级权益", done: "已完成" },
  fr: { from: "À partir de {tier}", quick: "Accès rapide", benefits: "Avantages par niveau", done: "complété" },
};

const inp = "w-full border border-line bg-black/30 px-4 py-3 text-sm text-fg outline-none placeholder:text-muted transition focus:border-accent";

const memberNo = (s: string) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const n = String(h % 100000000).padStart(8, "0");
  return `MR ${n.slice(0, 4)} ${n.slice(4)}`;
};

const ICONS: Record<string, string> = {
  overview: "M4 11l8-7 8 7v9H4z",
  profile: "M12 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 21c0-4 4-6 8-6s8 2 8 6",
  orders: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
  cart: "M5 8h14l-1 12H6zM9 8a3 3 0 0 1 6 0",
  vouchers: "M3 9V6h18v3a3 3 0 0 0 0 6v3H3v-3a3 3 0 0 0 0-6z",
  card: "M3 6h18v12H3zM3 10h18",
  settings: "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3v3M12 18v3M3 12h3M18 12h3",
  logout: "M10 4H5v16h5M15 8l4 4-4 4M19 12H9",
  lock: "M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3",
};

const STEP_ICONS = [
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
  "M2 7h11v9H2zM13 10h5l3 3v3h-8zM6 19a1.5 1.5 0 1 0 0-.01M17 19a1.5 1.5 0 1 0 0-.01",
  "M4 8l8-4 8 4v8l-8 4-8-4zM8 12l3 3 5-6",
  "M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z",
  "M4 12a8 8 0 1 0 3-6.2M4 4v5h5",
];

const Ico = ({ d, s = 18 }: { d: string; s?: number }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} className="shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Title = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6 flex items-center gap-4">
    <h2 className="font-serif text-2xl tracking-wide md:text-3xl">{children}</h2>
    <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
  </div>
);

const Glass = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`border border-accent/20 bg-white/[0.03] p-5 backdrop-blur-sm transition hover:border-accent/50 ${className}`}>{children}</div>
);

function useCount(target: number, ms = 1000) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Ring({ pct, color, sub }: { pct: number; color: string; sub: string }) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 150);
    return () => clearTimeout(id);
  }, []);
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(217,191,140,0.15)" strokeWidth="4" />
        <circle
          cx="64"
          cy="64"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={on ? C * (1 - pct / 100) : C}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(.2,.8,.2,1)", filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-serif text-3xl">{Math.round(pct)}%</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{sub}</div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { status } = useSession();
  const { t, lang, locale } = useLang();
  const { setCartOpen } = useStore();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [me, setMe] = useState<Me | null>(null);
  const [rec, setRec] = useState<Product[]>([]);
  const [view, setView] = useState<Tier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", birthday: "" });
  const [msg, setMsg] = useState("");
  const spendN = useCount(me?.spend ?? 0);
  const pointsN = useCount(me?.points ?? 0);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/dang-nhap");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/me")
      .then((r) => r.json())
      .then((u: Me) => {
        setMe(u);
        setForm({ name: u.name || "", phone: u.phone || "", birthday: u.birthday || "" });
      })
      .catch(() => {});
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setRec(Array.isArray(d) ? d.slice(0, 4) : []))
      .catch(() => {});
  }, [status]);

  async function save() {
    setMsg("");
    try {
      const r = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) return setMsg(t("a.err"));
      setMe(await r.json());
      setMsg(t("a.saved"));
    } catch {
      setMsg(t("a.err"));
    }
  }

  const fill = (s: string, v?: Record<string, string>) => {
    if (v) for (const x in v) s = s.split(`{${x}}`).join(v[x]);
    return s;
  };
  const mx = (k: string, v?: Record<string, string>) => fill(MX[lang][k] ?? MX.vi[k] ?? k, v);
  const tx = (k: string, v?: Record<string, string>) => fill(X[lang][k] ?? X.vi[k] ?? k, v);
  const bt = (k: string) => MX[lang][k] ?? t(k);
  const tname = (k: Tier) => TIER_NAMES[lang][k];

  const shell = (children: React.ReactNode) => (
    <div
      className="min-h-screen bg-bg text-fg"
      style={{ backgroundImage: "radial-gradient(60% 35% at 85% 0%, rgba(217,191,140,.07), transparent 60%), radial-gradient(50% 30% at 0% 40%, rgba(217,191,140,.04), transparent 60%)" }}
    >
      <style>{`@keyframes acc-fade{from{opacity:0}to{opacity:.3}}`}</style>
      <Header q={q} setQ={setQ} onSearch={() => router.push(q ? `/?q=${encodeURIComponent(q)}` : "/")} />
      {children}
      <Drawers />
    </div>
  );

  if (!me) return shell(<p className="py-32 text-center text-muted">…</p>);

  const tier = resolveTier(me.spend, me.tierOverride);
  const shown = view ?? tier;
  const sp = TIER_STYLE[shown];
  const cur = TIER_STYLE[tier];
  const nxt = nextTier(tier);
  const pct = nxt ? Math.max(0, Math.min(1, (me.spend - TIER_MIN[tier]) / (TIER_MIN[nxt] - TIER_MIN[tier]))) * 100 : 100;
  const number = memberNo(me.id);
  const joined = new Date(me.createdAt || Date.now());
  const since = joined.toLocaleDateString(locale, { day: "2-digit", month: "2-digit", year: "numeric" });
  const sinceLong = joined.toLocaleDateString(locale, { month: "2-digit", year: "numeric" });
  const holder = (me.name || me.email.split("@")[0]).toUpperCase();
  const display = (me.name || me.email).split(" ").slice(-1)[0];
  const [h1, h2] = t("a.hello", { name: "\u0001" }).split("\u0001");
  const firstTier = (k: string) => TIERS.find((x) => BENEFITS[x].includes(k)) as Tier;

  const progressText = nxt
    ? t("a.progress.next", { amount: vnd(Math.max(0, TIER_MIN[nxt] - me.spend)), tier: tname(nxt) })
    : tier === "amethyst"
      ? t("a.progress.max")
      : mx("inviteNote");

  const Stage = () => (
    <section className="relative isolate overflow-hidden border border-accent/15 bg-gradient-to-b from-white/[0.025] to-transparent p-6 md:p-10">
      <div
        key={shown}
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `radial-gradient(55% 55% at 28% 42%, ${sp.glow}, transparent 70%)`, opacity: 0.3, animation: "acc-fade .9s ease both" }}
      />
      <div className="grid gap-12 xl:grid-cols-[minmax(0,500px)_1fr]">
        <div>
          <MemberCard key={shown} tier={shown} holder={holder} number={number} since={since} />
          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted">{mx("hint")}</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {TIERS.map((k) => (
              <button key={k} onClick={() => setView(k)} aria-pressed={shown === k} className={`text-left transition duration-500 ${shown === k ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                <div
                  className="relative aspect-[1.6] overflow-hidden rounded-md border transition duration-500"
                  style={{
                    borderColor: shown === k ? TIER_STYLE[k].soft : "rgba(217,191,140,0.2)",
                    boxShadow: shown === k ? `0 0 22px -4px ${TIER_STYLE[k].glow}` : "none",
                    transform: shown === k ? "translateY(-3px)" : "none",
                    background: TIER_STYLE[k].front,
                  }}
                >
                  <img src={CARD_SRC[k]} alt="" className="absolute inset-0 h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.14em]" style={{ color: shown === k ? TIER_STYLE[k].soft : undefined }}>
                  {tname(k)}
                </div>
                {k === "amethyst" ? (
                  <div className="text-[10px] uppercase tracking-[0.14em]" style={{ color: TIER_STYLE.amethyst.soft }}>{mx("invite")}</div>
                ) : k === tier ? (
                  <div className="text-[10px] uppercase tracking-[0.14em] text-accent">{mx("current")}</div>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-8">
            <Ring pct={pct} color={cur.soft} sub={tx("done")} />
            <div className="min-w-[200px] flex-1">
              <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{t("a.progress")}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{progressText}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Glass>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("a.spent")}</div>
              <div className="mt-2 font-serif text-3xl md:text-4xl">{vnd(spendN)}</div>
            </Glass>
            <Glass>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted">{t("a.points")}</div>
              <div className="mt-2 font-serif text-3xl md:text-4xl">{pointsN.toLocaleString(locale)}</div>
            </Glass>
          </div>

          <div className="border-t border-accent/15 pt-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-accent">{mx("viewing")}</p>
            <h3 className="mt-2 font-serif text-5xl md:text-6xl" style={{ color: sp.soft, textShadow: `0 0 40px ${sp.glow}` }}>
              {tname(shown)}
            </h3>
            {shown === "amethyst" ? (
              <div className="mt-5">
                <span className="inline-block border px-3 py-1 text-[11px] uppercase tracking-[0.2em]" style={{ borderColor: sp.soft, color: sp.soft }}>
                  {mx("invite")}
                </span>
                <p className="mb-3 mt-5 text-xs uppercase tracking-[0.18em] text-muted">{mx("cond.title")}</p>
                <ul className="space-y-2 text-sm">
                  {["cond.1", "cond.2", "cond.3"].map((k) => (
                    <li key={k} className="flex gap-3">
                      <span style={{ color: sp.soft }}>✦</span>
                      {mx(k)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">{mx("range", { a: vnd(TIER_MIN[shown]), b: vnd(TIER_MAX[shown]) })}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  const Benefits = () => (
    <div>
      <Title>{tx("benefits")}</Title>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.amethyst.map((k) => {
          const on = BENEFITS[shown].includes(k);
          return (
            <li
              key={k}
              className={`flex items-start gap-3 border px-4 py-4 text-sm transition ${on ? "border-accent/30 bg-white/[0.03]" : "border-dashed border-line text-muted"}`}
              style={on ? { boxShadow: `inset 0 0 0 1px ${sp.soft}22` } : undefined}
            >
              <span className="mt-0.5" style={{ color: on ? sp.soft : undefined }}>
                {on ? "✦" : <Ico d={ICONS.lock} s={15} />}
              </span>
              <span>
                {bt(k)}
                {!on && <span className="mt-1 block text-[11px] uppercase tracking-[0.14em]">{tx("from", { tier: tname(firstTier(k)) })}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const Quick = () => {
    const items = [
      { key: "orders", text: t("a.nav.orders"), d: ICONS.orders, note: "0", act: () => setTab("orders") },
      { key: "vouchers", text: t("a.nav.vouchers"), d: ICONS.vouchers, note: String(me.vouchers.length), act: () => setTab("vouchers") },
      { key: "cart", text: t("a.nav.cart"), d: ICONS.cart, note: "", act: () => setCartOpen(true) },
      { key: "profile", text: t("a.nav.profile"), d: ICONS.profile, note: "", act: () => setTab("profile") },
    ];
    return (
      <div>
        <Title>{tx("quick")}</Title>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={i.act}
              className="group flex items-center gap-4 border border-accent/20 bg-white/[0.03] p-5 text-left transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-accent/[0.06]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition group-hover:bg-accent group-hover:text-accent-fg">
                <Ico d={i.d} s={20} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm">{i.text}</span>
                {i.note && <span className="font-serif text-xl text-accent">{i.note}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const Orders = () => (
    <div>
      <Title>{t("a.orders.title")}</Title>
      <div className="relative grid grid-cols-5 gap-2 border border-accent/15 bg-white/[0.02] px-2 py-8 text-center md:px-6">
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-[54px] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        {["a.orders.s1", "a.orders.s2", "a.orders.s3", "a.orders.s4", "a.orders.s5"].map((k, i) => (
          <div key={k} className="relative">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-bg text-accent">
              <Ico d={STEP_ICONS[i]} s={22} />
            </span>
            <div className="mt-3 font-serif text-2xl md:text-3xl">0</div>
            <div className="mt-1 text-[11px] leading-tight text-muted md:text-xs">{t(k)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Vouchers = () =>
    me.vouchers.length === 0 ? (
      <p className="border border-dashed border-line py-12 text-center text-muted">{t("a.vouchers.empty")}</p>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {me.vouchers.map((v) => (
          <div key={v.code} className="relative flex border border-accent/40 bg-gradient-to-r from-accent/10 to-transparent">
            <span className="absolute -top-2 left-[7.4rem] h-4 w-4 rounded-full border border-accent/40 bg-bg" />
            <span className="absolute -bottom-2 left-[7.4rem] h-4 w-4 rounded-full border border-accent/40 bg-bg" />
            <div className="flex w-[7.8rem] shrink-0 items-center justify-center border-r border-dashed border-accent/50 px-2 text-center font-serif text-2xl text-[#f0dca8]">{v.title}</div>
            <div className="p-5">
              <div className="text-sm text-muted">{v.desc}</div>
              <div className="mt-3 text-xs tracking-[0.2em] text-accent">{v.code}</div>
            </div>
          </div>
        ))}
      </div>
    );

  const nav: { key: Tab | "cart"; text: string }[] = [
    { key: "overview", text: t("a.nav.overview") },
    { key: "profile", text: t("a.nav.profile") },
    { key: "orders", text: t("a.nav.orders") },
    { key: "cart", text: t("a.nav.cart") },
    { key: "vouchers", text: t("a.nav.vouchers") },
    { key: "card", text: t("a.nav.card") },
    { key: "settings", text: t("a.nav.settings") },
  ];

  const navBtn = (on: boolean) =>
    `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:py-2.5 lg:pl-3.5 lg:text-[15px] ${
      on ? "border-accent bg-accent/10 text-accent lg:bg-gradient-to-r lg:from-accent/10 lg:to-transparent" : "border-line text-muted hover:text-fg lg:border-transparent"
    }`;

  return shell(
    <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[250px_1fr] lg:gap-12">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="mb-6 flex items-center gap-4 border border-accent/15 bg-white/[0.03] p-4 backdrop-blur-sm lg:mb-8">
          <div className="relative rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, #f3e3b5, ${cur.soft}, #8a6f3d)` }}>
            {me.image ? (
              <img src={me.image} alt="" referrerPolicy="no-referrer" className="h-14 w-14 rounded-full border-2 border-bg object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-bg font-serif text-2xl text-accent">{(me.name || me.email).charAt(0).toUpperCase()}</div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg" style={{ background: cur.soft, boxShadow: `0 0 10px ${cur.soft}` }} />
          </div>
          <div className="min-w-0">
            <div className="truncate">{me.name || me.email}</div>
            <div className="text-[11px] uppercase tracking-[0.2em]" style={{ color: cur.soft }}>
              {t("a.tier.label", { tier: tname(tier) })}
            </div>
          </div>
        </div>

        <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
          {nav.map((n) => (
            <button key={n.key} onClick={() => (n.key === "cart" ? setCartOpen(true) : setTab(n.key as Tab))} className={navBtn(tab === n.key)}>
              <Ico d={ICONS[n.key]} />
              {n.text}
            </button>
          ))}
          <button onClick={() => signOut({ redirectTo: "/" })} className={navBtn(false) + " lg:mt-3 lg:border-t lg:border-line"}>
            <Ico d={ICONS.logout} />
            {t("a.nav.logout")}
          </button>
        </nav>
      </aside>

      <section className="min-w-0 space-y-14">
        <div className="relative isolate overflow-hidden border border-accent/25">
          <SilkWaves />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-black/60" />
          <div className="relative z-10 flex min-h-[210px] flex-col justify-center gap-5 px-8 py-8 md:flex-row md:items-end md:justify-between md:px-12">
            <div>
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#d9bf8c]">{mx("since", { date: sinceLong })}</p>
              <h1 className="mt-3 font-serif text-4xl font-normal leading-tight text-[#f6efe0] md:text-6xl">
                {h1}
                <Shimmer>{display}</Shimmer>
                {h2}
              </h1>
            </div>
            <div
              className="flex items-center gap-3 self-start rounded-full border px-5 py-2.5 backdrop-blur-sm md:self-auto"
              style={{ borderColor: `${cur.soft}88`, boxShadow: `0 0 28px -8px ${cur.glow}`, background: "rgba(0,0,0,.35)" }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: cur.soft, boxShadow: `0 0 10px ${cur.soft}` }} />
              <span className="text-[11px] uppercase tracking-[0.24em]" style={{ color: cur.soft }}>
                {t("a.tier.label", { tier: tname(tier) })}
              </span>
              <span className="hidden text-[11px] tracking-[0.2em] text-[#f6efe0]/70 sm:inline">{number}</span>
            </div>
          </div>
        </div>

        {tab === "overview" && (
          <>
            <Reveal>
              <Stage />
            </Reveal>
            <Reveal>
              <Benefits />
            </Reveal>
            <Reveal>
              <Quick />
            </Reveal>
            <Reveal>
              <Orders />
            </Reveal>
            <Reveal>
              <div>
                <Title>{t("a.vouchers.title")}</Title>
                <Vouchers />
              </div>
            </Reveal>
            {rec.length > 0 && (
              <Reveal>
                <div>
                  <Title>MERCI</Title>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {rec.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                </div>
              </Reveal>
            )}
          </>
        )}

        {tab === "card" && (
          <>
            <Reveal>
              <Stage />
            </Reveal>
            <Reveal>
              <Benefits />
            </Reveal>
          </>
        )}

        {tab === "profile" && (
          <Reveal>
            <div className="max-w-lg">
              <Title>{t("a.profile.title")}</Title>
              <div className="space-y-4 border border-accent/15 bg-white/[0.02] p-6 md:p-8">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">{t("a.profile.name")}</label>
                  <input className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">{t("a.profile.email")}</label>
                  <input className={inp + " opacity-60"} value={me.email} disabled />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">{t("a.profile.phone")}</label>
                  <input className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted">{t("a.profile.birthday")}</label>
                  <input type="date" className={inp} value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
                </div>
                <button onClick={save} className="w-full bg-accent py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-accent-fg transition hover:opacity-85">
                  {t("a.save")}
                </button>
                {msg && <p className="text-sm text-muted">{msg}</p>}
              </div>
            </div>
          </Reveal>
        )}

        {tab === "orders" && (
          <Reveal>
            <Orders />
            <p className="py-8 text-center text-muted">{t("a.orders.empty")}</p>
          </Reveal>
        )}

        {tab === "vouchers" && (
          <Reveal>
            <div>
              <Title>{t("a.vouchers.title")}</Title>
              <Vouchers />
            </div>
          </Reveal>
        )}

        {tab === "settings" && (
          <Reveal>
            <div className="max-w-lg">
              <Title>{t("a.settings.title")}</Title>
              <div className="space-y-8 border border-accent/15 bg-white/[0.02] p-6 md:p-8">
                <LangPicker />
                <button
                  onClick={() => signOut({ redirectTo: "/" })}
                  className="w-full border border-line py-3.5 text-sm uppercase tracking-[0.2em] text-muted transition hover:border-accent hover:text-accent"
                >
                  {t("a.nav.logout")}
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </section>
    </main>
  );
}