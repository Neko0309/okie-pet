import type { CategoryId } from "./categories";

export type PackageShape = "can" | "box" | "bag";

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: CategoryId;
  shape: PackageShape;
  color: string;
  label: string;
  discount?: boolean;
  soldOut?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "尾巴生活 白月光流心罐",
    price: 3.99,
    category: "canned",
    shape: "can",
    color: "#BFD5EA",
    label: "白月光",
  },
  {
    id: "p2",
    name: "尾巴生活 莓莓流心罐",
    price: 3.69,
    category: "canned",
    shape: "can",
    color: "#F2C1CC",
    label: "莓莓",
  },
  {
    id: "p3",
    name: "诚实一口 小金袋猫粮",
    price: 51.99,
    category: "staple",
    shape: "bag",
    color: "#E9D29A",
    label: "小金袋",
    soldOut: true,
  },
  {
    id: "p4",
    name: "Petshy 白茶豆腐混合猫砂",
    price: 15.99,
    oldPrice: 18.99,
    category: "supplies",
    shape: "bag",
    color: "#D6E6CC",
    label: "白茶",
    discount: true,
  },
  {
    id: "p5",
    name: "朗诺 小靓兔",
    price: 17.9,
    category: "freeze-dried",
    shape: "bag",
    color: "#F0B5A8",
    label: "小靓兔",
  },
  {
    id: "p6",
    name: "Petshy 山茶花豆腐混木薯",
    price: 15.99,
    oldPrice: 18.99,
    category: "supplies",
    shape: "bag",
    color: "#F5D3DA",
    label: "山茶花",
    discount: true,
  },
  {
    id: "p7",
    name: "爱立方 小鲜砖",
    price: 19.49,
    category: "freeze-dried",
    shape: "box",
    color: "#BCD9EE",
    label: "小鲜砖",
  },
  {
    id: "p8",
    name: "urpet 全价猫用主食冻干",
    price: 24.9,
    category: "freeze-dried",
    shape: "box",
    color: "#CBB8DD",
    label: "主食冻干",
  },
  {
    id: "p9",
    name: "猫饭双拼餐盒 37.5g×2",
    price: 4.5,
    category: "canned",
    shape: "can",
    color: "#F7C6A3",
    label: "双拼",
  },
  {
    id: "p10",
    name: "鸡胸肉条 100g",
    price: 6.99,
    category: "snacks",
    shape: "bag",
    color: "#F4DDB0",
    label: "鸡肉条",
  },
  {
    id: "p11",
    name: "金枪鱼猫条 20支",
    price: 9.99,
    oldPrice: 12.99,
    category: "snacks",
    shape: "bag",
    color: "#F9D7A0",
    label: "猫条",
    discount: true,
  },
  {
    id: "p12",
    name: "羽毛逗猫棒",
    price: 8.99,
    category: "supplies",
    shape: "box",
    color: "#CFE3E0",
    label: "逗猫棒",
  },
];
