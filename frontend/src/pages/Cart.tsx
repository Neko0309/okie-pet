import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Cart.css";

export default function Cart() {
  const { t } = useTranslation();
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
