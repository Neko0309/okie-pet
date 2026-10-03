import { api } from "./api";
import { getToken } from "./auth";

export interface OrderItemOut {
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  image_url: string | null;
  price: string;
  quantity: number;
}

export interface OrderOut {
  id: string;
  order_number: string;
  status: string;
  subtotal: string;
  created_at: string;
  items: OrderItemOut[];
}

export interface OrderItemInput {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createOrder(items: OrderItemInput[]): Promise<OrderOut> {
  const res = await api.post<OrderOut>(
    "/orders",
    { items },
    { headers: authHeaders() },
  );
  return res.data;
}

export async function createCheckoutSession(items: OrderItemInput[]): Promise<string> {
  const res = await api.post<{ url: string }>(
    "/orders/checkout-session",
    { items },
    { headers: authHeaders() },
  );
  return res.data.url;
}

export async function fetchOrders(): Promise<OrderOut[]> {
  const res = await api.get<OrderOut[]>("/orders", { headers: authHeaders() });
  return res.data;
}

export async function fetchOrder(id: string): Promise<OrderOut> {
  const res = await api.get<OrderOut>(`/orders/${id}`, { headers: authHeaders() });
  return res.data;
}
