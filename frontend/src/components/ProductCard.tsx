import type { Product } from "../data/mockProducts";
import "./ProductCard.css";

export default function ProductCard({
  product,
  compact = false,
  onAdd,
}: {
  product: Product;
  compact?: boolean;
  onAdd?: (product: Product) => void;
}) {
  return (
    <div className={"product-card" + (compact ? " is-compact" : "")}>
      <div className="product-card__image" style={{ background: product.swatch }}>
        {product.discount && <span className="product-card__tag">折扣</span>}
        {product.soldOut && <span className="product-card__soldout">已售罄</span>}
        <span className="product-card__glyph">{product.glyph}</span>
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <div className="product-card__row">
          <span className="product-card__price">${product.price.toFixed(2)}</span>
          {!compact && (
            <button
              type="button"
              className="product-card__add"
              disabled={product.soldOut}
              onClick={() => onAdd?.(product)}
              aria-label={`加入购物车：${product.name}`}
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
