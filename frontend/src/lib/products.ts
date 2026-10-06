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
  vendor_en: string | null;
  image_url: string | null;
  is_active: boolean;
  variants: ApiVariant[];
}

export interface ApiVendor {
  name: string;
  name_en: string | null;
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
  vendor?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortMode;
  skip?: number;
  limit?: number;
}): Promise<ProductListResponse> {
  const query: Record<string, string | number> = {};
  if (params.category && params.category !== "all") query.category = params.category;
  if (params.vendor) query.vendor = params.vendor;
  if (params.minPrice !== undefined) query.min_price = params.minPrice;
  if (params.maxPrice !== undefined) query.max_price = params.maxPrice;
  if (params.sort) query.sort = params.sort;
  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;

  const res = await api.get<ProductListResponse>("/products", { params: query });
  return res.data;
}

export async function fetchVendors(): Promise<ApiVendor[]> {
  const res = await api.get<ApiVendor[]>("/products/vendors");
  return res.data;
}
