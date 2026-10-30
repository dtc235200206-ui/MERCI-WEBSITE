import { promises as fs } from "fs";
import path from "path";

export type User = {
  id: string;
  email: string;
  name: string;
  image: string;
  provider: string;
  phone: string;
  birthday: string;
  spend: number;
  points: number;
  vouchers: { code: string; title: string; desc: string }[];
  tierOverride?: string;
  createdAt: string;
};

const file = path.join(process.cwd(), "data", "users.json");

async function read(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return [];
  }
}

async function write(list: User[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf-8");
}

export async function getUser(id: string) {
  return (await read()).find((u) => u.id === id) ?? null;
}

export async function listUsers() {
  return read();
}

export async function upsertUser(b: { id: string; email: string; name: string; image: string; provider: string }) {
  const list = await read();
  const i = list.findIndex((u) => u.id === b.id);
  if (i >= 0) {
    list[i] = { ...list[i], email: b.email, image: b.image || list[i].image };
  } else {
    list.push({ ...b, phone: "", birthday: "", spend: 0, points: 0, vouchers: [], tierOverride: "", createdAt: new Date().toISOString() });
  }
  await write(list);
}

export async function updateUser(id: string, patch: { name: string; phone: string; birthday: string }) {
  const list = await read();
  const i = list.findIndex((u) => u.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], name: patch.name || list[i].name, phone: patch.phone, birthday: patch.birthday };
  await write(list);
  return list[i];
}

export async function setTierOverride(id: string, tier: string) {
  const list = await read();
  const i = list.findIndex((u) => u.id === id);
  if (i < 0) return null;
  list[i] = { ...list[i], tierOverride: tier };
  await write(list);
  return list[i];
}