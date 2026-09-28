import { api } from "./api";
import type { CategoryId } from "../data/categories";

export interface ApiVariant {
  id: string;
  name: string;
  name_en: string | null;
  price: string;
  stock_quantity: number;
}

export interface ApiProduct {
  id: string;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
  price: string;
  old_price: string | null;
  stock_quantity: number;
  category: string;
  vendor: string | null;
  image_url: string | null;
  is_active: boolean;
  variants: ApiVariant[];
}

export interface ProductListResponse {
  items: ApiProduct[];
  total: number;
  skip: number;
  limit: number;
}

export type SortMode = "recommended" | "price-asc" | "price-desc";

export async function fetchProducts(params: {
  category?: CategoryId | "all";
  sort?: SortMode;
  skip?: number;
  limit?: number;
}): Promise<ProductListResponse> {
  const query: Record<string, string | number> = {};
  if (params.category && params.category !== "all") query.category = params.category;
  if (params.sort) query.sort = params.sort;
  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;

  const res = await api.get<ProductListResponse>("/products", { params: query });
  return res.data;
}
