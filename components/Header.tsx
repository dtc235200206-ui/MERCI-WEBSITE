"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { useLang } from "@/lib/lang";
import { Shimmer } from "@/components/Fx";

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const menu = [
  { href: "/noi-bat?tab=best", k: "m.best" },
  { href: "/noi-bat?tab=sale", k: "m.sale" },
  { href: "/noi-bat?tab=new", k: "m.new" },
];

export default function Header({ q, setQ, onSearch }: { q: string; setQ: (v: string) => void; onSearch?: () => void }) {
  const { count, setCartOpen, setSettingsOpen } = useStore();
  const { t } = useLang();
  const { data: session, status } = useSession();
  const authed = status === "authenticated";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b text-[#f3ebdd] transition-all duration-300 ${
        scrolled
          ? "border-[#d9bf8c]/30 bg-black/60 shadow-[0_10px_30px_-15px_rgba(217,191,140,0.35)] backdrop-blur-xl"
          : "border-[#d9bf8c]/20 bg-black/85 backdrop-blur-md"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all duration-300 ${scrolled ? "py-1" : "py-2.5"}`}>
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="MERCI" className={`w-auto rounded-lg transition-all duration-300 ${scrolled ? "h-8" : "h-11"}`} />
          <span className={`font-serif font-semibold tracking-[0.3em] transition-all duration-300 ${scrolled ? "text-xl" : "text-2xl"}`}>
            <Shimmer>MERCI</Shimmer>
          </span>
        </Link>
        <div className="flex flex-1 overflow-hidden rounded-full border border-[#d9bf8c]/30 bg-white/5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
            placeholder={t("h.search")}
            className="min-w-0 flex-1 bg-transparent px-5 py-2.5 text-sm text-[#f3ebdd] outline-none placeholder:text-[#f3ebdd]/40"
          />
          <button onClick={() => onSearch?.()} className="shrink-0 bg-[#d9bf8c] px-6 text-sm font-semibold text-black transition hover:bg-[#e6d3a3]">{t("h.find")}</button>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="rounded-full p-2 text-[#f3ebdd]/80 transition hover:bg-white/10 hover:text-[#d9bf8c]" aria-label={t("h.settings")}>
          <Icon>
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </Icon>
        </button>
        <Link
          href={authed ? "/tai-khoan" : "/dang-nhap"}
          className="rounded-full p-2 text-[#f3ebdd]/80 transition hover:bg-white/10 hover:text-[#d9bf8c]"
          aria-label={authed ? t("a.h.account") : t("a.h.login")}
          title={authed ? t("a.h.account") : t("a.h.login")}
        >
          {authed && session?.user?.image ? (
            <img src={session.user.image} alt="" referrerPolicy="no-referrer" className="h-6 w-6 rounded-full border border-[#d9bf8c]/60 object-cover" />
          ) : (
            <Icon>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </Icon>
          )}
        </Link>
        <button
          data-cart-target
          onClick={() => setCartOpen(true)}
          className="relative rounded-full p-2 text-[#f3ebdd]/80 transition hover:bg-white/10 hover:text-[#d9bf8c]"
          aria-label={t("h.cart")}
        >
          <Icon>
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </Icon>
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d9bf8c] px-1 text-xs font-bold text-black">{count}</span>
          )}
        </button>

        <div ref={box} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className={`rounded-full p-2 transition hover:bg-white/10 hover:text-[#d9bf8c] ${open ? "bg-white/10 text-[#d9bf8c]" : "text-[#f3ebdd]/80"}`}
            aria-label={t("h.menu")}
            aria-expanded={open}
          >
            <Icon>
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </Icon>
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-3 w-60 rounded-xl border border-[#d9bf8c]/30 bg-black/95 p-2 shadow-[0_20px_50px_-15px_rgba(217,191,140,0.35)] backdrop-blur-md">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 transition hover:bg-white/10"
                >
                  <div className="text-sm font-semibold tracking-wide text-[#d9bf8c]">{t(m.k)}</div>
                  <div className="text-xs text-[#f3ebdd]/50">{t(m.k + ".sub")}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}