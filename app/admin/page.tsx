"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { categories, Product, Review, vnd } from "@/lib/data";
import { choiceGroups } from "@/lib/choices";
import Thumb from "@/components/Thumb";
import Stars from "@/components/Stars";

const empty = { name: "", brand: "", cat: "shoes", price: "", old: "", video: "", sold: "0" };
const inp = "w-full rounded-lg border border-line bg-soft px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";
const lbl = "mb-1 block text-xs text-muted";

export default function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState(empty);
  const [notes, setNotes] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [spin, setSpin] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [q, setQ] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const headers = { "Content-Type": "application/json", "x-admin-key": key };

  const load = () => fetch("/api/products").then((r) => r.json()).then(setItems);
  const loadReviews = () => fetch("/api/reviews", { headers }).then((r) => r.json()).then((d) => setReviews(Array.isArray(d) ? d : []));
  useEffect(() => { if (authed) { load(); loadReviews(); } }, [authed]);

  function resetForm() {
    setForm(empty); setNotes([]); setImages([]); setModel(""); setSpin([]); setLinkInput(""); setEditId(null);
  }

  async function login() {
    const r = await fetch("/api/admin", { method: "POST", headers: { "x-admin-key": key } });
    if (r.ok) { setAuthed(true); setMsg(""); } else setMsg("Sai mật khẩu");
  }

  async function save() {
    const r = await fetch(editId ? `/api/products/${editId}` : "/api/products", {
      method: editId ? "PUT" : "POST",
      headers,
      body: JSON.stringify({ ...form, notes, images, image: images[0] ?? "", model, spin }),
    });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error || "Có lỗi xảy ra");
    setMsg(editId ? "Đã cập nhật ✔" : "Đã thêm sản phẩm ✔");
    resetForm();
    load();
  }

  async function del(id: string) {
    if (!confirm("Xoá sản phẩm này?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE", headers });
    load();
  }

  async function delReview(id: string) {
    if (!confirm("Xoá đánh giá này?")) return;
    await fetch(`/api/reviews?id=${id}`, { method: "DELETE", headers });
    loadReviews(); load();
  }

  async function up(file: File): Promise<string | null> {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/upload", { method: "POST", headers: { "x-admin-key": key }, body: fd });
      const d = await r.json();
      if (r.ok) return d.url as string;
      setMsg(d.error || "Lỗi tải lên");
    } catch {
      setMsg("Tải lên thất bại (file có thể quá lớn)");
    }
    return null;
  }

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setMsg(`Đang tải ${list.length} ảnh lên...`);
    const urls: string[] = [];
    for (const f of list) {
      const u = await up(f);
      if (u) urls.push(u);
    }
    if (urls.length) {
      setImages((s) => [...s, ...urls]);
      setMsg(`Đã tải lên ${urls.length} ảnh ✔ (nhớ bấm Lưu)`);
    }
  }

  async function uploadVideo(file: File) {
    setMsg("Đang tải video lên, vui lòng đợi...");
    const u = await up(file);
    if (u) { set("video", u); setMsg("Đã tải lên ✔"); }
  }

  async function uploadModel(file: File) {
    setMsg("Đang tải mô hình 3D, vui lòng đợi...");
    const u = await up(file);
    if (u) { setModel(u); setMsg("Đã tải mô hình 3D ✔ (nhớ bấm Lưu)"); }
  }

  async function uploadSpin(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setMsg(`Đang tải ${list.length} ảnh xoay lên...`);
    const urls: string[] = [];
    for (const f of list) {
      const u = await up(f);
      if (u) urls.push(u);
    }
    if (urls.length) {
      setSpin((s) => [...s, ...urls]);
      setMsg(`Đã tải ${urls.length} ảnh xoay ✔ (nhớ bấm Lưu)`);
    }
  }

  function addLink() {
    const v = linkInput.trim();
    if (!v) return;
    setImages((s) => [...s, v]);
    setLinkInput("");
  }

  function edit(p: Product) {
    setEditId(p.id);
    setNotes(p.notes ?? []);
    setImages(p.images?.length ? p.images : p.image ? [p.image] : []);
    setModel(p.model ?? "");
    setSpin(p.spin ?? []);
    setForm({
      name: p.name, brand: p.brand, cat: p.cat, price: String(p.price), old: p.old ? String(p.old) : "",
      video: p.video, sold: String(p.sold),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-fg">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-7">
          <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Đăng nhập Admin</h1>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Mật khẩu" className={inp} />
          <button onClick={login} className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-fg hover:opacity-85">Đăng nhập</button>
          {msg && <p className="text-sm text-red-400">{msg}</p>}
        </div>
      </div>
    );
  }

  const shown = items.filter((p) => (p.name + " " + p.brand).toLowerCase().includes(q.toLowerCase()));
  const nameOf = (id: string) => items.find((p) => p.id === id)?.name ?? "(sản phẩm đã xoá)";

  return (
    <div className="min-h-screen bg-bg p-4 text-fg md:p-8">
      <div className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
        <h1 className="font-serif text-3xl font-medium tracking-wide text-accent">Quản lý sản phẩm</h1>
        <Link href="/" className="text-sm text-muted hover:text-accent">← Về trang chủ</Link>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[400px_1fr]">
        <div className="h-fit space-y-3 rounded-2xl border border-line bg-card p-5">
          <h2 className="text-lg font-bold">{editId ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>
          <input className={inp} placeholder="Tên sản phẩm" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input className={inp} placeholder="Thương hiệu (Nike, Dior...)" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          <select className={inp} value={form.cat} onChange={(e) => { set("cat", e.target.value); setNotes([]); }}>
            {categories.filter((c) => c.key !== "all").map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={lbl}>Giá bán (₫)</label><input className={inp} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></div>
            <div><label className={lbl}>Giá gốc (nếu giảm)</label><input className={inp} type="number" value={form.old} onChange={(e) => set("old", e.target.value)} /></div>
          </div>
          <div>
            <label className={lbl}>Lượt mua</label>
            <input className={inp} type="number" value={form.sold} onChange={(e) => set("sold", e.target.value)} />
          </div>

          {choiceGroups[form.cat] && (
            <div>
              <label className={lbl}>{choiceGroups[form.cat].adminLabel} (chọn nhiều)</label>
              <div className="flex flex-wrap gap-2">
                {choiceGroups[form.cat].options.map((n) => {
                  const on = notes.includes(n.key);
                  return (
                    <button
                      key={n.key}
                      type="button"
                      onClick={() => setNotes((s) => (on ? s.filter((x) => x !== n.key) : [...s, n.key]))}
                      className={`rounded-full border px-3 py-1 text-xs transition ${on ? "border-accent bg-accent text-accent-fg" : "border-line text-muted hover:border-accent/50"}`}
                    >
                      {n.emoji} {n.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className={lbl}>Ảnh sản phẩm ({images.length} ảnh, ảnh đầu tiên là ảnh bìa)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => { uploadImages(e.target.files); e.target.value = ""; }}
              className="text-sm text-muted"
            />
            <div className="flex gap-2">
              <input
                className={inp}
                placeholder="hoặc dán link ảnh rồi bấm Thêm"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLink()}
              />
              <button type="button" onClick={addLink} className="shrink-0 rounded-lg border border-accent px-4 text-sm text-accent hover:bg-accent hover:text-accent-fg">Thêm</button>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                  <div key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-line">
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-fg">Ảnh bìa</span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/75 p-1 opacity-0 transition group-hover:opacity-100">
                      {i > 0 ? (
                        <button type="button" onClick={() => setImages((s) => [src, ...s.filter((_, j) => j !== i)])} className="text-[11px] text-accent">★ Làm bìa</button>
                      ) : <span />}
                      <button type="button" onClick={() => setImages((s) => s.filter((_, j) => j !== i))} className="text-[11px] text-red-400">Xoá</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className={lbl}>Video (không bắt buộc, mp4 hoặc webm)</label>
            <input type="file" accept="video/mp4,video/webm" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} className="text-sm text-muted" />
            <input className={inp} placeholder="hoặc dán link video .mp4" value={form.video} onChange={(e) => set("video", e.target.value)} />
            {form.video && <video src={form.video} controls muted className="h-32 rounded-lg bg-black" />}
          </div>

          <div className="space-y-3 rounded-lg border border-accent/30 p-3">
            <label className={lbl + " !mb-0 font-semibold !text-accent"}>Xem 3D (không bắt buộc)</label>
            <p className="text-[11px] text-muted">Sản phẩm nào có mô hình 3D hoặc ảnh xoay mới hiện biểu tượng 3D ngoài trang.</p>

            <div className="space-y-2">
              <label className={lbl}>Mô hình 3D (file .glb)</label>
              <input type="file" accept=".glb" onChange={(e) => { if (e.target.files?.[0]) uploadModel(e.target.files[0]); e.target.value = ""; }} className="text-sm text-muted" />
              <input className={inp} placeholder="hoặc dán link file .glb" value={model} onChange={(e) => setModel(e.target.value)} />
              {model && (
                <button type="button" onClick={() => setModel("")} className="text-xs text-red-400">Xoá mô hình 3D</button>
              )}
            </div>

            <div className="space-y-2">
              <label className={lbl}>Ảnh xoay 360 (chọn nhiều ảnh, tên file đánh số 01, 02, 03...)</label>
              <input type="file" accept="image/*" multiple onChange={(e) => { uploadSpin(e.target.files); e.target.value = ""; }} className="text-sm text-muted" />
              {spin.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-accent">Đã có {spin.length} khung ảnh xoay</span>
                  <button type="button" onClick={() => setSpin([])} className="text-red-400">Xoá hết</button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={save} className="flex-1 rounded-lg bg-accent py-2 font-semibold text-accent-fg hover:opacity-85">{editId ? "Lưu thay đổi" : "Thêm sản phẩm"}</button>
            {editId && <button onClick={resetForm} className="rounded-lg border border-line px-4 py-2 text-muted hover:text-fg">Huỷ</button>}
          </div>
          {msg && <p className="text-sm text-muted">{msg}</p>}
        </div>

        <div className="rounded-2xl border border-line bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Sản phẩm ({items.length})</h2>
            <input className={inp + " max-w-xs"} placeholder="Tìm trong kho..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="divide-y divide-line">
            {shown.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2">
                <Thumb p={p} className="h-14 w-14 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted">
                    {p.brand} • {categories.find((c) => c.key === p.cat)?.label}
                    {(p.images?.length ?? 0) > 1 ? ` • ${p.images!.length} ảnh` : ""}
                    {p.video ? " • ▶ có video" : ""}
                    {p.model || (p.spin?.length ?? 0) > 1 ? " • có 3D" : ""}
                    {(p.notes ?? []).length > 0 ? ` • ${(p.notes ?? []).length} lựa chọn` : ""}
                    {p.reviews > 0 ? ` • ★ ${p.rating.toFixed(1)} (${p.reviews})` : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold text-accent">{vnd(p.price)}</div>
                <button onClick={() => edit(p)} className="rounded-lg border border-line px-3 py-1 text-sm hover:border-accent">Sửa</button>
                <button onClick={() => del(p.id)} className="rounded-lg border border-line px-3 py-1 text-sm text-red-400 hover:border-red-400">Xoá</button>
              </div>
            ))}
            {shown.length === 0 && <p className="py-10 text-center text-muted">Chưa có sản phẩm nào.</p>}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-3 text-lg font-bold">Đánh giá của khách ({reviews.length})</h2>
        <div className="divide-y divide-line">
          {reviews.slice(0, 50).map((r) => (
            <div key={r.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-muted"> đánh giá </span>
                  <span className="text-accent">{nameOf(r.productId)}</span>
                </div>
                <Stars value={r.stars} className="text-sm" />
                {r.comment && <p className="whitespace-pre-line text-sm text-fg/90">{r.comment}</p>}
                <div className="text-xs text-muted">{new Date(r.createdAt).toLocaleString("vi-VN")}</div>
              </div>
              <button onClick={() => delReview(r.id)} className="rounded-lg border border-line px-3 py-1 text-sm text-red-400 hover:border-red-400">Xoá</button>
            </div>
          ))}
          {reviews.length === 0 && <p className="py-8 text-center text-muted">Chưa có đánh giá nào.</p>}
        </div>
      </div>
    </div>
  );
}