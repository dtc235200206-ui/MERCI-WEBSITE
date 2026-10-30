import type { Lang } from "@/lib/i18n";

export type Tier = "silver" | "gold" | "diamond" | "ruby" | "sapphire" | "amethyst";
export const TIERS: Tier[] = ["silver", "gold", "diamond", "ruby", "sapphire", "amethyst"];
// Các hạng tự lên theo tổng tiền đã mua. Amethyst Dream chỉ do admin cấp.
export const AUTO_TIERS: Tier[] = ["silver", "gold", "diamond", "ruby", "sapphire"];

// CHỈNH Ở ĐÂY: tổng tiền đã mua (VND) để đạt từng hạng
export const TIER_MIN: Record<Tier, number> = {
  silver: 0,
  gold: 50_000_000,
  diamond: 200_000_000,
  ruby: 1_000_000_000,
  sapphire: 10_000_000_000,
  amethyst: 50_000_000_000,
};

// Chỉ để hiển thị khoảng tiền của từng hạng
export const TIER_MAX: Record<Tier, number> = {
  silver: 50_000_000,
  gold: 200_000_000,
  diamond: 1_000_000_000,
  ruby: 10_000_000_000,
  sapphire: 50_000_000_000,
  amethyst: 0,
};

export const CARD_SRC: Record<Tier, string> = {
  silver: "/cards/bac.webp",
  gold: "/cards/vang.webp",
  diamond: "/cards/kim-cuong.webp",
  ruby: "/cards/ruby.webp",
  sapphire: "/cards/sapphire.webp",
  amethyst: "/cards/amethyst.webp",
};

// soft = màu điểm nhấn, glow = ánh sáng quanh thẻ, front = nền dự phòng khi thiếu ảnh
export const TIER_STYLE: Record<Tier, { soft: string; glow: string; front: string }> = {
  silver: { soft: "#cfd3da", glow: "rgba(200,210,225,.55)", front: "linear-gradient(135deg,#8b9099,#eceef2,#a9aeb7)" },
  gold: { soft: "#e2bf6a", glow: "rgba(240,190,60,.6)", front: "linear-gradient(135deg,#7d6335,#f4e5b8,#b99c62)" },
  diamond: { soft: "#9fc7ff", glow: "rgba(150,190,255,.6)", front: "linear-gradient(135deg,#5d7ab0,#dbe9ff,#8fb0e6)" },
  ruby: { soft: "#ff5a78", glow: "rgba(235,45,75,.6)", front: "linear-gradient(135deg,#5a0a18,#d62a46,#f2c8c0)" },
  sapphire: { soft: "#5b86f0", glow: "rgba(60,100,255,.65)", front: "linear-gradient(135deg,#04103a,#1d46b8,#7aa0ff)" },
  amethyst: { soft: "#b07cff", glow: "rgba(150,90,255,.65)", front: "linear-gradient(135deg,#1b0a38,#6a2fd0,#c9a2ff)" },
};

export function tierOf(spend: number): Tier {
  return [...AUTO_TIERS].reverse().find((k) => spend >= TIER_MIN[k]) ?? "silver";
}

// Hạng admin cấp tay (nếu có) được ưu tiên hơn hạng tự tính theo tiền
export function resolveTier(spend: number, override?: string): Tier {
  return TIERS.includes(override as Tier) ? (override as Tier) : tierOf(spend);
}

export function nextTier(t: Tier): Tier | null {
  const i = AUTO_TIERS.indexOf(t);
  return i >= 0 && i < AUTO_TIERS.length - 1 ? AUTO_TIERS[i + 1] : null;
}

// Quyền lợi cộng dồn theo hạng. Chỉ là gợi ý, bạn có thể đổi.
const ADD: Record<Tier, string[]> = {
  silver: ["a.b.points", "a.b.welcome"],
  gold: ["a.b.bday"],
  diamond: ["a.b.ship", "a.b.early"],
  ruby: ["a.b.gift", "a.b.event"],
  sapphire: ["a.b.concierge"],
  amethyst: ["x.vip"],
};
export const BENEFITS = TIERS.reduce(
  (acc, k, i) => {
    acc[k] = [...(i ? acc[TIERS[i - 1]] : []), ...ADD[k]];
    return acc;
  },
  {} as Record<Tier, string[]>
);

export const TIER_NAMES: Record<Lang, Record<Tier, string>> = {
  vi: { silver: "Bạc", gold: "Vàng", diamond: "Kim cương", ruby: "Ruby", sapphire: "Sapphire", amethyst: "Amethyst Dream" },
  en: { silver: "Silver", gold: "Gold", diamond: "Diamond", ruby: "Ruby", sapphire: "Sapphire", amethyst: "Amethyst Dream" },
  zh: { silver: "银卡", gold: "金卡", diamond: "钻石卡", ruby: "红宝石卡", sapphire: "蓝宝石卡", amethyst: "紫晶之梦" },
  fr: { silver: "Argent", gold: "Or", diamond: "Diamant", ruby: "Rubis", sapphire: "Saphir", amethyst: "Amethyst Dream" },
};

// Chữ riêng của trang tài khoản và thẻ
export const MX: Record<Lang, Record<string, string>> = {
  vi: {
    since: "Thành viên MERCI từ {date}",
    current: "Hạng hiện tại",
    hint: "Rê chuột để nghiêng · Bấm vào thẻ để lật",
    viewing: "Đang xem",
    range: "Tổng đã mua từ {a} đến {b}",
    "cond.title": "Điều kiện (cần đủ cả ba)",
    "cond.1": "Chi tiêu từ 500 triệu ₫ mỗi tháng",
    "cond.2": "Tổng chi tiêu trên 50 tỷ ₫",
    "cond.3": "Là người nổi tiếng của các nhãn hàng hoặc đại sứ thương hiệu",
    invite: "Mời riêng",
    inviteNote: "Hạng Amethyst Dream chỉ dành cho khách được MERCI mời riêng.",
    "back.foot": "Thẻ thuộc sở hữu của MERCI · Chỉ chủ thẻ được sử dụng",
    "back.since": "THÀNH VIÊN TỪ",
    "x.vip": "Đặc quyền riêng do MERCI thiết kế cho từng khách mời",
  },
  en: {
    since: "MERCI member since {date}",
    current: "Current tier",
    hint: "Move to tilt · Click the card to flip",
    viewing: "Viewing",
    range: "Total spent from {a} to {b}",
    "cond.title": "Conditions (all three required)",
    "cond.1": "Spend 500 million ₫ or more per month",
    "cond.2": "Total spending above 50 billion ₫",
    "cond.3": "A celebrity of partner brands or a brand ambassador",
    invite: "By invitation",
    inviteNote: "Amethyst Dream is reserved for guests personally invited by MERCI.",
    "back.foot": "This card is the property of MERCI · For the cardholder only",
    "back.since": "MEMBER SINCE",
    "x.vip": "Private privileges designed by MERCI for each invited guest",
  },
  zh: {
    since: "MERCI 会员始于 {date}",
    current: "当前等级",
    hint: "移动鼠标倾斜 · 点击卡片翻面",
    viewing: "正在查看",
    range: "累计消费 {a} 至 {b}",
    "cond.title": "条件（需同时满足三项）",
    "cond.1": "每月消费满 5 亿越南盾",
    "cond.2": "累计消费超过 500 亿越南盾",
    "cond.3": "品牌名人或品牌大使",
    invite: "受邀专享",
    inviteNote: "Amethyst Dream 仅限 MERCI 特别邀请的宾客。",
    "back.foot": "本卡归 MERCI 所有 · 仅限持卡人使用",
    "back.since": "入会时间",
    "x.vip": "MERCI 为每位受邀宾客专属定制的特权",
  },
  fr: {
    since: "Membre MERCI depuis {date}",
    current: "Niveau actuel",
    hint: "Bougez la souris pour incliner · Cliquez pour retourner la carte",
    viewing: "Aperçu",
    range: "Total dépensé de {a} à {b}",
    "cond.title": "Conditions (les trois sont requises)",
    "cond.1": "Dépenser au moins 500 millions de ₫ par mois",
    "cond.2": "Dépenses totales supérieures à 50 milliards de ₫",
    "cond.3": "Être une célébrité des marques partenaires ou un ambassadeur de marque",
    invite: "Sur invitation",
    inviteNote: "Amethyst Dream est réservé aux invités personnellement choisis par MERCI.",
    "back.foot": "Cette carte appartient à MERCI · Réservée au titulaire",
    "back.since": "MEMBRE DEPUIS",
    "x.vip": "Privilèges privés conçus par MERCI pour chaque invité",
  },
};