import { NextResponse } from "next/server";
import { readProducts, readReviews, writeReviews, isAdmin } from "@/lib/db";
import type { Review } from "@/lib/data";

export async function GET(req: Request) {
  const productId = new URL(req.url).searchParams.get("productId");
  const all = await readReviews();
  if (!productId) {
    if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
    return NextResponse.json(all);
  }
  return NextResponse.json(all.filter((r) => r.productId === productId));
}

export async function POST(req: Request) {
  const b = await req.json();
  const stars = Math.round(Number(b.stars));
  if (!(stars >= 1 && stars <= 5)) {
    return NextResponse.json({ error: "Vui lòng chọn từ 1 đến 5 sao" }, { status: 400 });
  }
  const products = await readProducts();
  if (!products.some((p) => p.id === String(b.productId))) {
    return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  }
  const review: Review = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    productId: String(b.productId),
    name: String(b.name ?? "").trim().slice(0, 40) || "Khách",
    stars,
    comment: String(b.comment ?? "").trim().slice(0, 1000),
    createdAt: new Date().toISOString(),
  };
  const list = await readReviews();
  list.unshift(review);
  await writeReviews(list);
  return NextResponse.json(review);
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  await writeReviews((await readReviews()).filter((r) => r.id !== id));
  return NextResponse.json({ ok: true });
}