import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, type CategoryId } from "../data/categories";
import { fetchProducts, type ApiProduct, type ApiVariant, type SortMode } from "../lib/products";
import { useCart } from "../lib/cart";
import "./Products.css";

const SORT_CYCLE: SortMode[] = ["recommended", "price-asc", "price-desc"];

export default function Products() {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("cat") as CategoryId | null;
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">(
    initialCategory ?? "all",
  );
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

  function cycleSort() {
    const idx = SORT_CYCLE.indexOf(sortMode);
    setSortMode(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  }

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
        <div className="products__tabs">
          <button
            type="button"
            className={"products__tab" + (activeCategory === "all" ? " is-active" : "")}
            onClick={() => setActiveCategory("all")}
          >
            {t("nav.all")}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={"products__tab" + (activeCategory === c.id ? " is-active" : "")}
              onClick={() => setActiveCategory(c.id)}
            >
              {t(`category.${c.id}`)}
            </button>
          ))}
        </div>
        <button type="button" className="products__sort" onClick={cycleSort}>
          {t("products.sort_label")}
          {SORT_LABELS[sortMode]}
        </button>
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
