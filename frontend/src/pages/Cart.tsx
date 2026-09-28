import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../lib/cart";
import "./Cart.css";

export default function Cart() {
  const { t } = useTranslation();
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [showCheckoutNote, setShowCheckoutNote] = useState(false);

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <span className="cart-empty__glyph">🛒</span>
        <p className="cart-empty__title">{t("cart.empty_title")}</p>
        <p className="cart-empty__sub">{t("cart.empty_sub")}</p>
        <Link to="/products" className="cart-empty__cta">
          {t("cart.cta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="cart-page__title">{t("cart.title")}</h1>

      <div className="cart-page__layout">
        <ul className="cart-list">
          {items.map((item) => (
            <li key={item.key} className="cart-row">
              <div className="cart-row__image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <span aria-hidden="true">🐾</span>
                )}
              </div>
              <div className="cart-row__info">
                <p className="cart-row__name">{item.name}</p>
                {item.variantName && (
                  <p className="cart-row__variant">{item.variantName}</p>
                )}
                <button
                  type="button"
                  className="cart-row__remove"
                  onClick={() => removeItem(item.key)}
                >
                  {t("cart.remove")}
                </button>
              </div>
              <div className="cart-row__qty">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.key, item.quantity - 1)}
                  aria-label="-"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  aria-label="+"
                >
                  +
                </button>
              </div>
              <div className="cart-row__price">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-summary">
          <div className="cart-summary__row">
            <span>{t("cart.subtotal")}</span>
            <b>${subtotal.toFixed(2)}</b>
          </div>
          <button
            type="button"
            className="cart-summary__checkout"
            onClick={() => setShowCheckoutNote(true)}
          >
            {t("cart.checkout")}
          </button>
          {showCheckoutNote && (
            <p className="cart-summary__note">{t("cart.checkout_note")}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
