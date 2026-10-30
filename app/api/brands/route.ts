import { NextResponse, connection } from "next/server";
import { isAdmin } from "@/lib/db";
import { readBrands, writeBrands } from "@/lib/brandsDb";

const bad = () => NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });

export async function GET() {
  await connection();
  return NextResponse.json(await readBrands());
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return bad();
  const b = await req.json();
  const name = String(b.name ?? "").trim().slice(0, 60);
  if (!name) return NextResponse.json({ error: "Thiếu tên thương hiệu" }, { status: 400 });
  const list = await readBrands();
  const brand = { id: Date.now().toString(), name, image: String(b.image ?? "") };
  list.push(brand);
  await writeBrands(list);
  return NextResponse.json(brand);
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return bad();
  const id = new URL(req.url).searchParams.get("id");
  const b = await req.json();
  const list = await readBrands();
  const i = list.findIndex((x) => x.id === id);
  if (i < 0) return NextResponse.json({ error: "Không tìm thấy thương hiệu" }, { status: 404 });
  const name = String(b.name ?? "").trim().slice(0, 60) || list[i].name;
  list[i] = { ...list[i], name, image: String(b.image ?? "") };
  await writeBrands(list);
  return NextResponse.json(list[i]);
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return bad();
  const id = new URL(req.url).searchParams.get("id");
  await writeBrands((await readBrands()).filter((x) => x.id !== id));
  return NextResponse.json({ ok: true });
}