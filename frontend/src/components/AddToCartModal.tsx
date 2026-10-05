import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DOMPurify from "dompurify";
import type { ApiProduct, ApiVariant } from "../lib/products";
import { localize } from "../lib/localize";
import "./AddToCartModal.css";

export default function AddToCartModal({
  product,
  onClose,
  onConfirm,
}: {
  product: ApiProduct;
  onClose: () => void;
  onConfirm: (variant: ApiVariant | null, quantity: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const hasVariants = product.variants.length > 0;
  const lang = i18n.language;

  const name = localize(lang, product.name, product.name_en);
  const description = localize(lang, product.description ?? "", product.description_en) || null;
  const ingredients =
    localize(lang, product.ingredients ?? "", product.ingredients_en) || null;

  const cleanDescription = useMemo(
    () => (description ? DOMPurify.sanitize(description) : null),
    [description],
  );

  const [ingredientsOpen, setIngredientsOpen] = useState(false);

  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    if (!hasVariants) return null;
    const firstInStock = product.variants.find((v) => v.stock_quantity > 0);
    return (firstInStock ?? product.variants[0]).id;
  });
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = hasVariants
    ? (product.variants.find((v) => v.id === selectedVariantId) ?? null)
    : null;

  const price = Number(selectedVariant ? selectedVariant.price : product.price);
  const availableStock = selectedVariant
    ? selectedVariant.stock_quantity
    : product.stock_quantity;
  const soldOut = hasVariants ? !selectedVariant || availableStock <= 0 : availableStock <= 0;

  function clampQuantity(next: number) {
    const max = Math.max(1, availableStock);
    setQuantity(Math.min(Math.max(1, next), max));
  }

  function handleConfirm() {
    if (soldOut) return;
    onConfirm(selectedVariant, quantity);
  }

  return (
    <div className="add-modal-scrim" onClick={onClose}>
      <div
        className="add-modal"
        role="dialog"
        aria-modal="true"
        aria-label={name}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="add-modal__close"
          onClick={onClose}
          aria-label={t("add_modal.close")}
        >
          ✕
        </button>

        <div className="add-modal__head">
          <div className="add-modal__image">
            {product.image_url ? (
              <img src={product.image_url} alt={name} />
            ) : (
              <span aria-hidden="true">🐾</span>
            )}
          </div>
          <div>
            <p className="add-modal__name">{name}</p>
            <p className="add-modal__price">${price.toFixed(2)}</p>
          </div>
        </div>

        {cleanDescription && (
          <div className="add-modal__details">
            <p className="add-modal__label">{t("add_modal.details")}</p>
            <div
              className="add-modal__details-body"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          </div>
        )}

        <div className="add-modal__section">
          <button
            type="button"
            className="add-modal__ingredients-toggle"
            onClick={() => setIngredientsOpen((open) => !open)}
            aria-expanded={ingredientsOpen}
          >
            {t("add_modal.view_ingredients")}
            <span aria-hidden="true">{ingredientsOpen ? "−" : "+"}</span>
          </button>
          {ingredientsOpen && (
            <p className="add-modal__ingredients-body">
              {ingredients ?? t("add_modal.ingredients_unavailable")}
            </p>
          )}
        </div>

        {hasVariants && (
          <div className="add-modal__section">
            <p className="add-modal__label">{t("add_modal.choose_option")}</p>
            <div className="add-modal__options">
              {product.variants.map((v) => {
                const optionSoldOut = v.stock_quantity <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    className={
                      "add-modal__option" +
                      (v.id === selectedVariantId ? " is-selected" : "") +
                      (optionSoldOut ? " is-disabled" : "")
                    }
                    disabled={optionSoldOut}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                  >
                    <span className="add-modal__option-name">
                      {localize(lang, v.name, v.name_en)}
                      {optionSoldOut ? ` (${t("product_card.stamp_sold_out")})` : ""}
                    </span>
                    <span className="add-modal__option-price">
                      ${Number(v.price).toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="add-modal__section">
          <p className="add-modal__label">{t("add_modal.quantity")}</p>
          <div className="add-modal__qty">
            <button type="button" onClick={() => clampQuantity(quantity - 1)}>
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={Math.max(1, availableStock)}
              value={quantity}
              onChange={(e) => clampQuantity(Number(e.target.value) || 1)}
            />
            <button type="button" onClick={() => clampQuantity(quantity + 1)}>
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          className="add-modal__confirm"
          disabled={soldOut}
          onClick={handleConfirm}
        >
          {soldOut
            ? t("product_card.stamp_sold_out")
            : `${t("add_modal.confirm")} · $${(price * quantity).toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
