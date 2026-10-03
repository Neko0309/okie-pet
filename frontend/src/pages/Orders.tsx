import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchOrders, type OrderOut } from "../lib/orders";
import { useCart } from "../lib/cart";
import "./Orders.css";

export default function Orders() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clear } = useCart();
  const justPlaced = (location.state as { justPlaced?: string } | null)?.justPlaced;
  const paymentSuccess = searchParams.get("checkout") === "success";

  const [orders, setOrders] = useState<OrderOut[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Stripe redirects here as soon as payment succeeds, but the Order
      // row is created asynchronously by the webhook — it's usually
      // already there by the time this page loads, but give it a few
      // short retries rather than flashing "no orders yet" on the rare
      // slow delivery.
      const maxAttempts = paymentSuccess ? 4 : 1;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        let data: OrderOut[] = [];
        try {
          data = await fetchOrders();
        } catch {
          data = [];
        }
        if (cancelled) return;
        if (paymentSuccess && data.length === 0 && attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        setOrders(data);
        setLoading(false);
        return;
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // The local cart is still sitting in localStorage until we clear it —
    // the order itself was created server-side by the webhook, not by
    // this page.
    if (paymentSuccess) clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentSuccess]);

  if (loading) return null;

  if (orders.length === 0 && !paymentSuccess) {
    return (
      <div className="orders-empty">
        <span aria-hidden="true">📦</span>
        <p className="orders-empty__title">{t("orders.empty_title")}</p>
        <p className="orders-empty__sub">{t("orders.empty_sub")}</p>
        <Link to="/products" className="orders-empty__cta">
          {t("cart.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-page container">
      <h1 className="orders-page__title">{t("orders.title")}</h1>

      {justPlaced && (
        <p className="orders-page__banner">
          {t("orders.just_placed", { orderNumber: justPlaced })}
        </p>
      )}
      {paymentSuccess && (
        <p className="orders-page__banner">{t("orders.payment_success")}</p>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card__head">
              <div>
                <p className="order-card__number">
                  {t("orders.order_label")} {order.order_number}
                </p>
                <p className="order-card__date">
                  {t("orders.placed_at")}{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <p className="order-card__subtotal">${Number(order.subtotal).toFixed(2)}</p>
            </div>
            <ul className="order-card__items">
              {order.items.map((item, idx) => (
                <li key={idx} className="order-item">
                  <div className="order-item__image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.product_name} />
                    ) : (
                      <span aria-hidden="true">🐾</span>
                    )}
                  </div>
                  <div className="order-item__info">
                    <p className="order-item__name">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="order-item__variant">{item.variant_name}</p>
                    )}
                  </div>
                  <p className="order-item__qty">×{item.quantity}</p>
                  <p className="order-item__price">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
