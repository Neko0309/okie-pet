import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ProductCard";
import SortDropdown from "../components/SortDropdown";
import type { CategoryId } from "../data/categories";
import { fetchProducts, type ApiProduct, type ApiVariant, type SortMode } from "../lib/products";
import { useCart } from "../lib/cart";
import "./Products.css";

export default function Products() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  // The top nav's category links are the only category picker now (used to
  // be duplicated by an in-page tab row) — read straight from the URL on
  // every change rather than local state, so clicking a different category
  // while already on this page actually updates the list.
  const activeCategory = (searchParams.get("cat") as CategoryId | null) ?? "all";
  const [sortMode, setSortMode] = useState<SortMode>("recommended");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const SORT_LABELS: Record<SortMode, string> = {
    recommended: t("products.sort_recommended"),
    "price-asc": t("products.sort_price_asc"),
    "price-desc": t("products.sort_price_desc"),
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts({ category: activeCategory, sort: sortMode, limit: 100 })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, sortMode]);

  function handleAdd(product: ApiProduct, variant: ApiVariant | null, quantity: number) {
    addItem(
      {
        productId: product.id,
        variantId: variant?.id ?? null,
        name: product.name,
        nameEn: product.name_en,
        variantName: variant?.name ?? null,
        variantNameEn: variant?.name_en ?? null,
        price: Number(variant ? variant.price : product.price),
        image: product.image_url,
        maxQuantity: variant ? variant.stock_quantity : product.stock_quantity,
      },
      quantity,
    );
  }

  return (
    <div className="products container">
      <header className="products__header">
        <SortDropdown
          value={sortMode}
          onChange={setSortMode}
          labels={SORT_LABELS}
          prefixLabel={t("products.sort_label")}
        />
      </header>

      {!loading && (
        <div className="products__grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={handleAdd} />
          ))}
          {products.length === 0 && (
            <p className="products__empty">{t("products.empty")}</p>
          )}
        </div>
      )}
    </div>
  );
}
