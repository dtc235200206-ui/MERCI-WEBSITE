"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/data";

const inp = "w-full rounded-lg border border-line bg-soft px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";
const empty = { name: "", image: "" };

export default function AdminBrands() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<Brand[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const headers = { "Content-Type": "application/json", "x-admin-key": key };
  const load = () => fetch("/api/brands").then((r) => r.json()).then((d) => setList(Array.isArray(d) ? d : []));

  async function login() {
    const r = await fetch("/api/admin", { method: "POST", headers: { "x-admin-key": key } });
    if (r.ok) {
      setAuthed(true);
      setMsg("");
      load();
    } else setMsg("Sai mật khẩu");
  }

  async function save() {
    const r = await fetch(editId ? `/api/brands?id=${editId}` : "/api/brands", {
      method: editId ? "PUT" : "POST",
      headers,
      body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || "Có lỗi xảy ra");
    setMsg(editId ? "Đã cập nhật ✔" : "Đã thêm thương hiệu ✔");
    setForm(empty);
    setEditId(null);
    load();
  }

  async function del(id: string) {
    if (!confirm("Xoá thương hiệu này khỏi mục Luxury Fashion Brands?")) return;
    await fetch(`/api/brands?id=${id}`, { method: "DELETE", headers });
    load();
  }

  async function upload(file: File) {
    setMsg("Đang tải ảnh lên...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", headers: { "x-admin-key": key }, body: fd });
      const d = await r.json();
      if (r.ok) {
        setForm((f) => ({ ...f, image: d.url }));
        setMsg("Đã tải ảnh lên ✔");
      } else setMsg(d.error || "Lỗi tải ảnh");
    } catch {
      setMsg("Tải ảnh thất bại");
    }
  }

  function edit(b: Brand) {
    setEditId(b.id);
    setForm({ name: b.name, image: b.image });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-fg">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-7">
          <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Đăng nhập Admin</h1>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Mật khẩu"
            className={inp}
          />
          <button onClick={login} className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-fg hover:opacity-85">
            Đăng nhập
          </button>
          {msg && <p className="text-sm text-red-400">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-4 text-fg md:p-8">
      <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Luxury Fashion Brands</h1>
        <div className="flex gap-6 text-sm">
          <Link href="/admin" className="text-muted hover:text-accent">Quản lý sản phẩm</Link>
          <Link href="/" className="text-muted hover:text-accent">← Về trang chủ</Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[360px_1fr]">
        <div className="h-fit space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-bold">{editId ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h2>
          <input className={inp} placeholder="Tên hãng (Dior, Chanel, Nike...)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="space-y-2">
            <label className="block text-xs text-muted">Ảnh thương hiệu (nên là ảnh dọc 3:4)</label>
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} className="text-sm text-muted" />
            <input className={inp} placeholder="hoặc dán link ảnh" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            {form.image && <img src={form.image} alt="" className="h-40 w-30 rounded-lg object-cover" />}
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 rounded-lg bg-accent py-2 font-semibold text-accent-fg hover:opacity-85">
              {editId ? "Lưu thay đổi" : "Thêm thương hiệu"}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm(empty); }} className="rounded-lg border border-line px-4 py-2 text-muted hover:text-fg">
                Huỷ
              </button>
            )}
          </div>
          {msg && <p className="text-sm text-muted">{msg}</p>}
          <p className="text-xs leading-relaxed text-muted">
            Sản phẩm có ô &quot;Thương hiệu&quot; trùng tên hãng ở đây sẽ tự xuất hiện trong danh mục Cao Cấp. Từ hãng thứ 5 trở đi, dải thương hiệu trên trang chủ sẽ tự chạy.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-3 text-lg font-bold">Thương hiệu ({list.length})</h2>
          <div className="divide-y divide-line">
            {list.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 py-3">
                <div
                  className="h-20 w-16 shrink-0 rounded-md border border-line bg-cover bg-center"
                  style={{ backgroundImage: b.image ? `url(${b.image})` : "linear-gradient(165deg,#1d1a13,#0c0c0d)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-lg">{b.name}</div>
                  <div className="text-xs text-muted">Ô số {i + 1}{b.image ? "" : " • chưa có ảnh"}</div>
                </div>
                <button onClick={() => edit(b)} className="rounded-lg border border-line px-3 py-1 text-sm hover:border-accent">Sửa</button>
                <button onClick={() => del(b.id)} className="rounded-lg border border-line px-3 py-1 text-sm text-red-400 hover:border-red-400">Xoá</button>
              </div>
            ))}
            {list.length === 0 && <p className="py-10 text-center text-muted">Chưa có thương hiệu nào.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}