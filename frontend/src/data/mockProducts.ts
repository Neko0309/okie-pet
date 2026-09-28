import type { CategoryId } from "./categories";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: CategoryId;
  glyph: string;
  swatch: string;
  discount?: boolean;
  soldOut?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "尾巴生活 白月光流心罐",
    price: 3.99,
    category: "canned",
    glyph: "🥫",
    swatch: "#dceefb",
    discount: true,
  },
  {
    id: "p2",
    name: "朗诺 全价猫用主食冻干",
    price: 17.9,
    category: "freeze-dried",
    glyph: "🍖",
    swatch: "#fbe3e3",
  },
  {
    id: "p3",
    name: "爱立方 小鲜砖鸡肉冻干",
    price: 19.49,
    category: "freeze-dried",
    glyph: "🍖",
    swatch: "#e4f0e9",
  },
  {
    id: "p4",
    name: "诚实一口 小金袋猫粮",
    price: 51.99,
    category: "staple",
    glyph: "🍚",
    swatch: "#f3ecd8",
    soldOut: true,
  },
  {
    id: "p5",
    name: "Petshy 混合豆腐猫砂",
    price: 15.99,
    category: "supplies",
    glyph: "🧴",
    swatch: "#e6efe6",
    discount: true,
  },
  {
    id: "p6",
    name: "Furry Tail 莓莓流心罐",
    price: 3.69,
    category: "canned",
    glyph: "🥫",
    swatch: "#fbe6ef",
  },
  {
    id: "p7",
    name: "urpet 全价猫用主食冻干",
    price: 22.5,
    category: "freeze-dried",
    glyph: "🍖",
    swatch: "#eef0e0",
  },
  {
    id: "p8",
    name: "尾巴生活 鸡肉磨牙零食",
    price: 8.9,
    category: "snacks",
    glyph: "🦴",
    swatch: "#f7ecd6",
  },
  {
    id: "p9",
    name: "Petshy 山茶花豆腐猫砂",
    price: 15.99,
    category: "supplies",
    glyph: "🧴",
    swatch: "#e6efe6",
    discount: true,
  },
];
