import { promises as fs } from "fs";
import path from "path";
import type { Brand } from "./data";

const file = path.join(process.cwd(), "data", "brands.json");

const seed: Brand[] = [
  { id: "dior", name: "Dior", image: "" },
  { id: "chanel", name: "Chanel", image: "" },
  { id: "nike", name: "Nike", image: "" },
  { id: "gucci", name: "Gucci", image: "" },
];

export async function readBrands(): Promise<Brand[]> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return seed;
  }
}

export async function writeBrands(list: Brand[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf-8");
}