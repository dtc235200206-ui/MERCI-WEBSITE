"use client";
import { useEffect, useState } from "react";
import type { Review } from "@/lib/data";
import Stars from "@/components/Stars";

const labels = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];
const inp = "w-full rounded-lg border border-line bg-soft px-3 py-2 text-sm text-fg outline-none placeholder:text-muted focus:border-accent";

export default function Reviews({ productId, onChange }: { productId: string; onChange: () => void }) {
  const [list, setList] = useState<Review[]>([]);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("merci-name") ?? "" : ""));
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => fetch(`/api/reviews?productId=${productId}`).then((r) => r.json()).then(setList);
  useEffect(() => { load(); }, [productId]);

  const avg = list.length ? list.reduce((s, r) => s + r.stars, 0) / list.length : 0;
  const shown = hover || stars;

  async function submit() {
    if (!stars) return setMsg("Vui lòng chọn số sao");
    setBusy(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, name, stars, comment }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMsg(d.error || "Có lỗi xảy ra");
      } else {
        localStorage.setItem("merci-name", name);
        setStars(0);
        setComment("");
        setMsg("Cảm ơn bạn đã đánh giá ✔");
        await load();
        onChange();
      }
    } catch {
      setMsg("Không gửi được đánh giá, vui lòng thử lại");
    }
    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="font-serif text-3xl font-medium tracking-wide">Đánh giá sản phẩm</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-accent/60 to-transparent" />
      </div>

      <div className="grid gap-6 rounded-xl border border-line bg-card p-5 sm:grid-cols-[160px_1fr]">
        <div className="space-y-1 text-center">
          <div className="text-4xl font-semibold">{list.length ? avg.toFixed(1) : "–"}</div>
          <Stars value={avg} className="text-xl" />
          <div className="text-xs text-muted">{list.length} lượt đánh giá</div>
        </div>
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((n) => {
            const c = list.filter((r) => r.stars === n).length;
            return (
              <div key={n} className="flex items-center gap-2 text-xs text-muted">
                <span className="w-8">{n} ★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded bg-soft">
                  <div className="h-full bg-accent" style={{ width: `${list.length ? (c / list.length) * 100 : 0}%` }} />
                </div>
                <span className="w-6 text-right">{c}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-line bg-card p-5">
        <h3 className="font-semibold">Viết đánh giá của bạn</h3>
        <div className="flex items-center gap-3">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onClick={() => setStars(n)}
                aria-label={`${n} sao`}
                className={`text-4xl leading-none transition ${n <= shown ? "text-accent" : "text-muted/40"}`}
              >
                ★
              </button>
            ))}
          </div>
          <span className="text-sm text-muted">{labels[shown]}</span>
        </div>
        <input className={inp} placeholder="Tên của bạn (không bắt buộc)" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className={inp} rows={3} maxLength={1000} placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." value={comment} onChange={(e) => setComment(e.target.value)} />
        <button onClick={submit} disabled={busy} className="w-full rounded-lg bg-accent py-2.5 font-semibold text-accent-fg transition hover:opacity-85 disabled:opacity-50">
          {busy ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
        {msg && <p className="text-sm text-muted">{msg}</p>}
      </div>

      <div className="divide-y divide-line">
        {list.map((r) => (
          <div key={r.id} className="space-y-1.5 py-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">{r.name}</span>
              <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString("vi-VN")}</span>
            </div>
            <Stars value={r.stars} className="text-sm" />
            {r.comment && <p className="whitespace-pre-line text-sm text-fg/90">{r.comment}</p>}
          </div>
        ))}
        {list.length === 0 && <p className="py-8 text-center text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>}
      </div>
    </section>
  );
}