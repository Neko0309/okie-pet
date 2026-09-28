import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ApiProduct, ApiVariant } from "../lib/products";
import "./ProductCard.css";

export default function ProductCard({
  product,
  compact = false,
  onAdd,
}: {
  product: ApiProduct;
  compact?: boolean;
  onAdd?: (product: ApiProduct, variant: ApiVariant | null) => void;
}) {
  const { t } = useTranslation();
  const hasVariants = product.variants.length > 0;

  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    if (!hasVariants) return null;
    const firstInStock = product.variants.find((v) => v.stock_quantity > 0);
    return (firstInStock ?? product.variants[0]).id;
  });

  const selectedVariant = hasVariants
    ? (product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0])
    : null;

  const price = Number(selectedVariant ? selectedVariant.price : product.price);
  const oldPrice = !selectedVariant && product.old_price ? Number(product.old_price) : null;
  const soldOut = selectedVariant
    ? selectedVariant.stock_quantity <= 0
    : product.stock_quantity <= 0;

  return (
    <div className={"product-card" + (compact ? " is-compact" : "")}>
      <div className="product-card__image">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" aria-hidden="true">
            🐾
          </div>
        )}
        {oldPrice && (
          <span className="product-card__tag">{t("product_card.tag_discount")}</span>
        )}
        {soldOut && (
          <div className="product-card__stamp">
            <b>{t("product_card.stamp_sold_out")}</b>
          </div>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__name">{product.name}</p>

        {hasVariants && !compact && (
          <select
            className="product-card__variant-select"
            value={selectedVariantId ?? undefined}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock_quantity <= 0}>
                {v.name}
                {v.stock_quantity <= 0 ? ` (${t("product_card.stamp_sold_out")})` : ""}
              </option>
            ))}
          </select>
        )}

        <div className="product-card__row">
          <span className="product-card__price">
            ${price.toFixed(2)}
            {oldPrice && <s className="product-card__old-price">${oldPrice.toFixed(2)}</s>}
          </span>
          {!compact && (
            <button
              type="button"
              className="product-card__add"
              disabled={soldOut}
              onClick={() => onAdd?.(product, selectedVariant)}
              aria-label={
                soldOut
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
