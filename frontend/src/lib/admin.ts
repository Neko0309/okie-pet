import { api } from "./api";
import { getToken } from "./auth";
import type { ApiVariant } from "./products";

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  vendor: string | null;
  image_url: string | null;
  price: string;
  old_price: string | null;
  stock_quantity: number;
  is_active: boolean;
  external_source: string;
  updated_at: string;
  variants: ApiVariant[];
}

export interface AdminProductListResponse {
  items: AdminProduct[];
  total: number;
  skip: number;
  limit: number;
}

export interface AdminProductPatch {
  name?: string;
  category?: string;
  price?: number;
  old_price?: number | null;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface AdminVariantPatch {
  price?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface AdminOrderItem {
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  price: string;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  items: AdminOrderItem[];
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAdminProducts(params: {
  search?: string;
  skip?: number;
  limit?: number;
}): Promise<AdminProductListResponse> {
  const res = await api.get<AdminProductListResponse>("/admin/products", {
    headers: authHeaders(),
    params,
  });
  return res.data;
}

export async function updateAdminProduct(
  id: string,
  patch: AdminProductPatch,
): Promise<AdminProduct> {
  const res = await api.patch<AdminProduct>(`/admin/products/${id}`, patch, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function updateAdminVariant(
  productId: string,
  variantId: string,
  patch: AdminVariantPatch,
): Promise<AdminProduct> {
  const res = await api.patch<AdminProduct>(
    `/admin/products/${productId}/variants/${variantId}`,
    patch,
    { headers: authHeaders() },
  );
  return res.data;
}

export async function fetchAdminOrders(params: {
  skip?: number;
  limit?: number;
}): Promise<AdminOrder[]> {
  const res = await api.get<AdminOrder[]>("/admin/orders", {
    headers: authHeaders(),
    params,
  });
  return res.data;
}

export async function exportAdminProducts(): Promise<void> {
  const res = await api.get("/admin/products/export", {
    headers: authHeaders(),
    responseType: "blob",
  });

  const disposition = res.headers["content-disposition"] as string | undefined;
  const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? "okiepet-products.xlsx";

  const url = URL.createObjectURL(res.data as Blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export interface AdminImportResult {
  created: number;
  updated: number;
  deactivated: number;
  total_rows: number;
}

export async function importAdminProducts(file: File): Promise<AdminImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<AdminImportResult>("/admin/products/import", formData, {
    headers: authHeaders(),
  });
  return res.data;
}
