import { useEffect, useState } from "react";
import { fetchAdminOrders, type AdminOrder } from "../../lib/admin";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders({ limit: 100 })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <div className="admin-orders">
      {orders.length === 0 && <p className="admin-orders__empty">No orders yet.</p>}

      {orders.map((order) => (
        <div key={order.id} className="admin-order-card">
          <div className="admin-order-card__head">
            <div>
              <p className="admin-order-card__number">{order.order_number}</p>
              <p className="admin-order-card__customer">
                {order.customer_name} · {order.customer_email}
              </p>
              <p className="admin-order-card__date">
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
            <p className="admin-order-card__subtotal">${Number(order.subtotal).toFixed(2)}</p>
          </div>
          <ul className="admin-order-card__items">
            {order.items.map((item, idx) => (
              <li key={idx}>
                <span>
                  {item.product_name}
                  {item.variant_name ? ` · ${item.variant_name}` : ""}
                </span>
                <span>
                  ×{item.quantity} · ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
