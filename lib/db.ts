import { promises as fs } from "fs";
import path from "path";
import { Product, Review } from "./data";

const file = path.join(process.cwd(), "data", "products.json");
const reviewFile = path.join(process.cwd(), "data", "reviews.json");

export async function readReviews(): Promise<Review[]> {
  try {
    return JSON.parse(await fs.readFile(reviewFile, "utf-8"));
  } catch {
    return [];
  }
}

export async function writeReviews(list: Review[]) {
  await fs.mkdir(path.dirname(reviewFile), { recursive: true });
  await fs.writeFile(reviewFile, JSON.stringify(list, null, 2), "utf-8");
}

export async function readProducts(): Promise<Product[]> {
  let list: Partial<Product>[] = [];
  try {
    list = JSON.parse(await fs.readFile(file, "utf-8"));
  } catch {
    return [];
  }
  const reviews = await readReviews();
  return list.map((p) => {
    const rs = reviews.filter((r) => r.productId === p.id);
    const avg = rs.length ? rs.reduce((s, r) => s + r.stars, 0) / rs.length : 0;
    return { video: "", ...p, rating: Math.round(avg * 10) / 10, reviews: rs.length } as Product;
  });
}

export async function writeProducts(list: Product[]) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(list, null, 2), "utf-8");
}

export function isAdmin(req: Request) {
  const key = process.env.ADMIN_PASSWORD;
  return !!key && req.headers.get("x-admin-key") === key;
}