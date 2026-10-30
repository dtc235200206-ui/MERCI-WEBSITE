import { NextResponse } from "next/server";
import { readProducts, writeProducts, isAdmin } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const { id } = await params;
  const b = await req.json();
  const list = await readProducts();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
  const images: string[] = Array.isArray(b.images) ? b.images.map(String).filter(Boolean) : [];
  const spin: string[] = Array.isArray(b.spin) ? b.spin.map(String).filter(Boolean) : [];
  list[i] = {
    ...list[i],
    name: String(b.name),
    brand: String(b.brand ?? ""),
    cat: String(b.cat),
    price: Number(b.price),
    old: b.old ? Number(b.old) : undefined,
    image: images[0] ?? String(b.image ?? ""),
    images,
    video: String(b.video ?? ""),
    model: String(b.model ?? ""),
    spin,
    sold: Number(b.sold) || 0,
    notes: Array.isArray(b.notes) ? b.notes.map(String) : [],
  };
  await writeProducts(list);
  return NextResponse.json(list[i]);
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const { id } = await params;
  await writeProducts((await readProducts()).filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}