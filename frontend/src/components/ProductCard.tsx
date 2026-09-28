import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ApiProduct, ApiVariant } from "../lib/products";
import { localize } from "../lib/localize";
import AddToCartModal from "./AddToCartModal";
import "./ProductCard.css";

export default function ProductCard({
  product,
  compact = false,
  onAdd,
}: {
  product: ApiProduct;
  compact?: boolean;
  onAdd?: (product: ApiProduct, variant: ApiVariant | null, quantity: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const name = localize(i18n.language, product.name, product.name_en);
  const price = Number(product.price);
  const oldPrice = product.old_price ? Number(product.old_price) : null;
  const soldOut = product.stock_quantity <= 0;

  return (
    <div className={"product-card" + (compact ? " is-compact" : "")}>
      <div className="product-card__image">
        {product.image_url ? (
          <img src={product.image_url} alt={name} loading="lazy" />
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
        <p className="product-card__name">{name}</p>
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
              onClick={() => setModalOpen(true)}
              aria-label={
                soldOut
                  ? t("product_card.sold_out_aria")
                  : `${t("product_card.add_to_cart")}: ${name}`
              }
            >
              +
            </button>
          )}
        </div>
      </div>

      {modalOpen && (
        <AddToCartModal
          product={product}
          onClose={() => setModalOpen(false)}
          onConfirm={(variant, quantity) => {
            onAdd?.(product, variant, quantity);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
