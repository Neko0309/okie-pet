import { Link } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  return (
    <div className="cart-empty">
      <span className="cart-empty__glyph">🛒</span>
      <p className="cart-empty__title">购物车还是空的</p>
      <p className="cart-empty__sub">看看有什么新鲜好物吧</p>
      <Link to="/products" className="cart-empty__cta">
        去逛逛
      </Link>
    </div>
  );
}
