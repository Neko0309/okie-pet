import { useState } from "react";
import type { AdminProduct } from "../../lib/admin";
import { updateAdminProduct, updateAdminVariant } from "../../lib/admin";
import { CATEGORIES } from "../../data/categories";
import "./AdminProductModal.css";

export default function AdminProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: AdminProduct;
  onClose: () => void;
  onSaved: (updated: AdminProduct) => void;
}) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [category, setCategory] = useState(product.category);
  const [isActive, setIsActive] = useState(product.is_active);
  const [variantDrafts, setVariantDrafts] = useState(
    Object.fromEntries(
      product.variants.map((v) => [
        v.id,
        { price: v.price, stock: String(v.stock_quantity) },
      ]),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProduct() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminProduct(product.id, {
        price: Number(price),
        stock_quantity: Number(stock),
        category,
        is_active: isActive,
      });
      onSaved(updated);
    } catch {
      setError("Save failed, please try again");
    } finally {
      setSaving(false);
    }
  }

  async function saveVariant(variantId: string) {
    const draft = variantDrafts[variantId];
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminVariant(product.id, variantId, {
        price: Number(draft.price),
        stock_quantity: Number(draft.stock),
      });
      onSaved(updated);
    } catch {
      setError("Save failed, please try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-scrim" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="admin-modal__close" onClick={onClose}>
          ✕
        </button>

        <div className="admin-modal__head">
          <div className="admin-modal__image">
            {product.image_url ? <img src={product.image_url} alt={product.name} /> : "🐾"}
          </div>
          <div>
            <p className="admin-modal__name">{product.name}</p>
            <p className="admin-modal__vendor">{product.vendor}</p>
          </div>
        </div>

        <div className="admin-modal__grid">
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" />
          </label>
          <label>
            Stock
            <input value={stock} onChange={(e) => setStock(e.target.value)} inputMode="numeric" />
          </label>
          <label className="admin-modal__checkbox">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active (visible in store)
          </label>
        </div>

        <button type="button" className="admin-modal__save" disabled={saving} onClick={saveProduct}>
          Save product
        </button>

        {product.variants.length > 0 && (
          <div className="admin-modal__variants">
            <p className="admin-modal__label">Variants</p>
            {product.variants.map((v) => (
              <div key={v.id} className="admin-variant-row">
                <span className="admin-variant-row__name">{v.name}</span>
                <input
                  value={variantDrafts[v.id]?.price ?? ""}
                  onChange={(e) =>
                    setVariantDrafts((prev) => ({
                      ...prev,
                      [v.id]: { ...prev[v.id], price: e.target.value },
                    }))
                  }
                  inputMode="decimal"
                />
                <input
                  value={variantDrafts[v.id]?.stock ?? ""}
                  onChange={(e) =>
                    setVariantDrafts((prev) => ({
                      ...prev,
                      [v.id]: { ...prev[v.id], stock: e.target.value },
                    }))
                  }
                  inputMode="numeric"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => saveVariant(v.id)}
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="admin-modal__error">{error}</p>}
      </div>
    </div>
  );
}
