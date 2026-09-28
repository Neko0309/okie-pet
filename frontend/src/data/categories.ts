export type CategoryId =
  | "freeze-dried"
  | "snacks"
  | "canned"
  | "staple"
  | "supplies"
  | "deals";

export interface Category {
  id: CategoryId;
}

export const CATEGORIES: Category[] = [
  { id: "freeze-dried" },
  { id: "supplies" },
  { id: "canned" },
  { id: "staple" },
  { id: "snacks" },
  { id: "deals" },
];
