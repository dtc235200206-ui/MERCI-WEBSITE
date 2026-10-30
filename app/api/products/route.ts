import { NextResponse } from "next/server";
import { connection } from "next/server";
import { readProducts, writeProducts, isAdmin } from "@/lib/db";

export async function GET() {
  await connection();
  return NextResponse.json(await readProducts());
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const b = await req.json();
  if (!b.name || !(Number(b.price) > 0)) {
    return NextResponse.json({ error: "Thiếu tên hoặc giá" }, { status: 400 });
  }
  const images: string[] = Array.isArray(b.images) ? b.images.map(String).filter(Boolean) : [];
  const spin: string[] = Array.isArray(b.spin) ? b.spin.map(String).filter(Boolean) : [];
  const list = await readProducts();
  const p = {
    id: Date.now().toString(),
    name: String(b.name),
    brand: String(b.brand ?? ""),
    cat: String(b.cat ?? "shoes"),
    price: Number(b.price),
    old: b.old ? Number(b.old) : undefined,
    image: images[0] ?? String(b.image ?? ""),
    images,
    video: String(b.video ?? ""),
    model: String(b.model ?? ""),
    spin,
    sold: Number(b.sold) || 0,
    rating: 0,
    reviews: 0,
    notes: Array.isArray(b.notes) ? b.notes.map(String) : [],
  };
  list.unshift(p);
  await writeProducts(list);
  return NextResponse.json(p);
}