import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <div className={"product-card" + (compact ? " is-compact" : "")}>
      <div className="product-card__image">
        <ProductArt
          shape={product.shape}
          color={product.color}
          label={product.label}
          name={product.name}
        />
        {product.discount && (
          <span className="product-card__tag">{t("product_card.tag_discount")}</span>
        )}
        {product.soldOut && (
          <div className="product-card__stamp">
            <b>{t("product_card.stamp_sold_out")}</b>
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
                product.soldOut
                  ? t("product_card.sold_out_aria")
                  : `${t("product_card.add_to_cart")}: ${product.name}`
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
