import type { Product } from "../data/mockProducts";
import ProductArt from "./ProductArt";
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
      <div className="product-card__image">
        <ProductArt
          shape={product.shape}
          color={product.color}
          label={product.label}
          name={product.name}
        />
        {product.discount && <span className="product-card__tag">折扣</span>}
        {product.soldOut && (
          <div className="product-card__stamp">
            <b>已售罄</b>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>
        <div className="product-card__row">
          <span className="product-card__price">
            ${product.price.toFixed(2)}
            {product.oldPrice && (
              <s className="product-card__old-price">
                ${product.oldPrice.toFixed(2)}
              </s>
            )}
          </span>
          {!compact && (
            <button
              type="button"
              className="product-card__add"
              disabled={product.soldOut}
              onClick={() => onAdd?.(product)}
              aria-label={
                product.soldOut ? "已售罄" : `把 ${product.name} 加入购物车`
              }
            >
              +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
