"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { TIERS, TIER_NAMES, tierOf } from "@/lib/membership";
import { vnd } from "@/lib/data";

type U = { id: string; email: string; name: string; image: string; spend: number; tierOverride?: string; createdAt: string };

const inp = "w-full rounded-lg border border-line bg-soft px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";

export default function AdminUsers() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<U[]>([]);
  const [msg, setMsg] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-key": key };
  const load = () =>
    fetch("/api/admin/users", { headers })
      .then((r) => r.json())
      .then((d) => setList(Array.isArray(d) ? d : []));

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  async function login() {
    const r = await fetch("/api/admin", { method: "POST", headers: { "x-admin-key": key } });
    if (r.ok) {
      setAuthed(true);
      setMsg("");
    } else setMsg("Sai mật khẩu");
  }

  async function setTier(id: string, tier: string) {
    const r = await fetch("/api/admin/users", { method: "PUT", headers, body: JSON.stringify({ id, tier }) });
    setMsg(r.ok ? "Đã lưu ✔" : "Có lỗi xảy ra");
    load();
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-fg">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-7">
          <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Đăng nhập Admin</h1>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Mật khẩu" className={inp} />
          <button onClick={login} className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-fg hover:opacity-85">Đăng nhập</button>
          {msg && <p className="text-sm text-red-400">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 text-fg md:p-8">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Khách hàng và hạng thẻ</h1>
        <Link href="/admin" className="text-sm text-muted hover:text-accent">← Quản lý sản phẩm</Link>
      </div>
      <div className="mx-auto max-w-5xl rounded-2xl border border-line bg-card p-5">
        {msg && <p className="mb-3 text-sm text-muted">{msg}</p>}
        <div className="divide-y divide-line">
          {list.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-4 py-3">
              {u.image ? (
                <img src={u.image} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent text-accent">{(u.name || u.email).charAt(0).toUpperCase()}</div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{u.name || u.email}</div>
                <div className="truncate text-xs text-muted">
                  {u.email} • đã mua {vnd(u.spend)}
                  {u.spend >= 50_000_000_000 ? " • đủ điều kiện chi tiêu của Amethyst Dream" : ""}
                </div>
              </div>
              <select className={inp + " max-w-[240px]"} value={u.tierOverride ?? ""} onChange={(e) => setTier(u.id, e.target.value)}>
                <option value="">Tự động theo chi tiêu ({TIER_NAMES.vi[tierOf(u.spend)]})</option>
                {TIERS.map((k) => (
                  <option key={k} value={k}>Cấp tay: {TIER_NAMES.vi[k]}</option>
                ))}
              </select>
            </div>
          ))}
          {list.length === 0 && <p className="py-10 text-center text-muted">Chưa có khách nào đăng nhập.</p>}
        </div>
      </div>
    </div>
  );
}