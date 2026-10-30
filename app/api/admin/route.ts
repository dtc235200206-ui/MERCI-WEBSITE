import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/db";

export async function POST(req: Request) {
  return isAdmin(req)
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
}