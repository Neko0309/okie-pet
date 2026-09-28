import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { CATEGORIES, type CategoryId } from "../data/categories";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import "./Products.css";

type SortMode = "recommended" | "price-asc" | "price-desc";

const SORT_LABELS: Record<SortMode, string> = {
  recommended: "推荐",
  "price-asc": "价格 ↑",
  "price-desc": "价格 ↓",
};

const SORT_CYCLE: SortMode[] = ["recommended", "price-asc", "price-desc"];

export default function Products() {
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [sortMode, setSortMode] = useState<SortMode>("recommended");

  const products = useMemo(() => {
    let list = MOCK_PRODUCTS;
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (sortMode === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price);
    } else if (sortMode === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [activeCategory, sortMode]);

  function cycleSort() {
    const idx = SORT_CYCLE.indexOf(sortMode);
    setSortMode(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
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
            全部
          </button>
          {CATEGORIES.filter((c) => c.id !== "deals").map((c) => (
            <button
              key={c.id}
              type="button"
              className={"products__tab" + (activeCategory === c.id ? " is-active" : "")}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <button type="button" className="products__sort" onClick={cycleSort}>
          排序：{SORT_LABELS[sortMode]}
        </button>
      </header>

      <div className="products__grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {products.length === 0 && (
          <p className="products__empty">这个分类还没有商品</p>
        )}
      </div>
    </div>
  );
}
