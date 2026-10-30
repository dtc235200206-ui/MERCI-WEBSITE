export type Product = {
  id: string; name: string; brand: string; cat: string;
  price: number; old?: number; image: string; images?: string[]; video: string;
  model?: string; spin?: string[];
  sold: number; rating: number; reviews: number; notes?: string[];
};

export type Review = {
  id: string; productId: string; name: string;
  stars: number; comment: string; createdAt: string;
};

export type Brand = { id: string; name: string; image: string };

export const categories = [
  { key: "all", label: "Tất cả", emoji: "🛍️" },
  { key: "luxury", label: "Cao Cấp", emoji: "💎" },
  { key: "shoes", label: "Giày dép", emoji: "👟" },
  { key: "clothes", label: "Quần áo", emoji: "🧥" },
  { key: "bags", label: "Túi xách", emoji: "👜" },
  { key: "perfume", label: "Nước hoa", emoji: "🌸" },
  { key: "cosmetics", label: "Mỹ phẩm", emoji: "💄" },
  { key: "jewelry", label: "Trang sức", emoji: "💍" },
];

export const catEmoji = (cat: string) => categories.find((c) => c.key === cat)?.emoji ?? "🛍️";
export const vnd = (n: number) => n.toLocaleString("vi-VN") + "₫";