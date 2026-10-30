import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/db";

const allowed = ["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "glb"];

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Sai mật khẩu" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Không có file" }, { status: 400 });
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: "Chỉ nhận ảnh (jpg, png, webp, gif), video (mp4, webm) hoặc mô hình 3D (glb)" }, { status: 400 });
  }
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${name}` });
}