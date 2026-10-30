import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/db";
import { listUsers, setTierOverride } from "@/lib/usersDb";

const ok = ["", "silver", "gold", "diamond", "ruby", "sapphire", "amethyst"];

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  return NextResponse.json(await listUsers());
}

export async function PUT(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const b = await req.json();
  const tier = String(b.tier ?? "");
  if (!ok.includes(tier)) return NextResponse.json({ error: "Hạng không hợp lệ" }, { status: 400 });
  const u = await setTierOverride(String(b.id ?? ""), tier);
  if (!u) return NextResponse.json({ error: "Không tìm thấy khách" }, { status: 404 });
  return NextResponse.json(u);
}