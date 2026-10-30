export type Opt = { key: string; label: string; emoji: string; bg: string };
export type Group = { title: string; adminLabel: string; options: Opt[] };

export const choiceGroups: Record<string, Group> = {
  shoes: {
    title: "Bạn thích loại giày nào?",
    adminLabel: "Loại giày",
    options: [
      { key: "sneaker", label: "Sneaker", emoji: "👟", bg: "from-sky-900/50 to-black" },
      { key: "running", label: "Chạy bộ", emoji: "🏃", bg: "from-emerald-900/50 to-black" },
      { key: "basketball", label: "Bóng rổ", emoji: "🏀", bg: "from-orange-900/50 to-black" },
      { key: "dress", label: "Giày da", emoji: "👞", bg: "from-amber-950/70 to-black" },
      { key: "boot", label: "Boot", emoji: "🥾", bg: "from-stone-700/50 to-black" },
      { key: "sandal", label: "Sandal, dép", emoji: "🩴", bg: "from-yellow-900/40 to-black" },
    ],
  },
  clothes: {
    title: "Bạn đang tìm trang phục nào?",
    adminLabel: "Loại trang phục",
    options: [
      { key: "tshirt", label: "Áo thun", emoji: "👕", bg: "from-sky-900/50 to-black" },
      { key: "shirt", label: "Áo sơ mi", emoji: "👔", bg: "from-slate-700/50 to-black" },
      { key: "jacket", label: "Áo khoác", emoji: "🧥", bg: "from-amber-950/70 to-black" },
      { key: "puffer", label: "Áo bông", emoji: "☁️", bg: "from-blue-900/40 to-black" },
      { key: "hoodie", label: "Hoodie, nỉ", emoji: "🧶", bg: "from-zinc-700/50 to-black" },
      { key: "pants", label: "Quần", emoji: "👖", bg: "from-indigo-900/50 to-black" },
      { key: "dress", label: "Váy, đầm", emoji: "👗", bg: "from-rose-900/50 to-black" },
    ],
  },
  perfume: {
    title: "Chọn tối đa 3 nốt hương bạn thích",
    adminLabel: "Nốt hương",
    options: [
      { key: "floral", label: "Hương hoa", emoji: "🌸", bg: "from-rose-900/50 to-black" },
      { key: "green", label: "Hương xanh", emoji: "🌿", bg: "from-emerald-900/50 to-black" },
      { key: "oud", label: "Trầm Oud", emoji: "🪵", bg: "from-amber-950/70 to-black" },
      { key: "vanilla", label: "Vani", emoji: "🍦", bg: "from-yellow-900/40 to-black" },
      { key: "leather", label: "Da thuộc", emoji: "🧳", bg: "from-orange-950/70 to-black" },
      { key: "incense", label: "Hương khói", emoji: "🕯️", bg: "from-stone-700/50 to-black" },
      { key: "citrus", label: "Cam chanh", emoji: "🍋", bg: "from-lime-900/40 to-black" },
      { key: "aromatic", label: "Thảo mộc", emoji: "🍃", bg: "from-teal-900/50 to-black" },
      { key: "musk", label: "Xạ hương", emoji: "🤍", bg: "from-zinc-700/50 to-black" },
    ],
  },
  cosmetics: {
    title: "Bạn quan tâm nhóm mỹ phẩm nào?",
    adminLabel: "Nhóm mỹ phẩm",
    options: [
      { key: "lips", label: "Son môi", emoji: "💄", bg: "from-rose-900/50 to-black" },
      { key: "face", label: "Nền, phấn", emoji: "🪞", bg: "from-orange-900/40 to-black" },
      { key: "skincare", label: "Dưỡng da", emoji: "🧴", bg: "from-teal-900/50 to-black" },
      { key: "eyes", label: "Mắt, mày", emoji: "👁️", bg: "from-indigo-900/50 to-black" },
      { key: "sunscreen", label: "Chống nắng", emoji: "☀️", bg: "from-yellow-900/40 to-black" },
    ],
  },
  jewelry: {
    title: "Bạn muốn tìm món trang sức nào?",
    adminLabel: "Loại trang sức",
    options: [
      { key: "ring", label: "Nhẫn", emoji: "💍", bg: "from-yellow-900/40 to-black" },
      { key: "necklace", label: "Dây chuyền", emoji: "📿", bg: "from-amber-950/70 to-black" },
      { key: "bracelet", label: "Vòng tay", emoji: "⌚", bg: "from-stone-700/50 to-black" },
      { key: "earring", label: "Bông tai", emoji: "✨", bg: "from-rose-900/40 to-black" },
      { key: "watch", label: "Đồng hồ", emoji: "🕰️", bg: "from-slate-700/50 to-black" },
    ],
  },
};