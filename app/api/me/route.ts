import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUser, updateUser, upsertUser } from "@/lib/usersDb";

export async function GET() {
  const s = await auth();
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id || !s?.user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let u = await getUser(id);
  if (!u) {
    await upsertUser({ id, email: s.user.email, name: s.user.name ?? "", image: s.user.image ?? "", provider: id.split(":")[0] });
    u = await getUser(id);
  }
  return NextResponse.json(u);
}

export async function PUT(req: Request) {
  const s = await auth();
  const id = (s?.user as { id?: string } | undefined)?.id;
  if (!id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json();
  const u = await updateUser(id, {
    name: String(b.name ?? "").trim().slice(0, 80),
    phone: String(b.phone ?? "").trim().slice(0, 20),
    birthday: String(b.birthday ?? "").slice(0, 10),
  });
  return NextResponse.json(u);
}