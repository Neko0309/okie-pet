export type CategoryId =
  | "freeze-dried"
  | "snacks"
  | "canned"
  | "staple"
  | "supplies"
  | "deals";

export interface Category {
  id: CategoryId;
  label: string;
  glyph: string;
  bg: string;
}

export const CATEGORIES: Category[] = [
  { id: "freeze-dried", label: "冻干", glyph: "🍖", bg: "#f6e6c7" },
  { id: "supplies", label: "用品", glyph: "🧴", bg: "#dcecea" },
  { id: "canned", label: "罐头", glyph: "🥫", bg: "#f3d9dd" },
  { id: "staple", label: "主粮", glyph: "🍚", bg: "#e6e3d3" },
  { id: "snacks", label: "零食", glyph: "🦴", bg: "#f6ecd0" },
  { id: "deals", label: "折扣", glyph: "🏷️", bg: "#f1dda0" },
];
