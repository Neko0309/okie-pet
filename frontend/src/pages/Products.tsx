import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/ProductCard";
import SortDropdown from "../components/SortDropdown";
import type { CategoryId } from "../data/categories";
import {
  fetchProducts,
  fetchVendors,
  type ApiProduct,
  type ApiVariant,
  type SortMode,
} from "../lib/products";
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

  // Typed values update immediately (so the inputs feel responsive); the
  // debounced copies are what actually drive the fetch, so a fast typist
  // doesn't fire a request per keystroke.
  const [vendorInput, setVendorInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [vendor, setVendor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [vendors, setVendors] = useState<string[]>([]);
  const [vendorDropdownOpen, setVendorDropdownOpen] = useState(false);

  useEffect(() => {
    fetchVendors()
      .then(setVendors)
      .catch(() => setVendors([]));
  }, []);

  const filteredVendors = vendors.filter((v) =>
    v.toLowerCase().includes(vendorInput.trim().toLowerCase()),
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVendor(vendorInput);
      setMinPrice(minPriceInput);
      setMaxPrice(maxPriceInput);
    }, 400);
    return () => clearTimeout(timeout);
  }, [vendorInput, minPriceInput, maxPriceInput]);

  const SORT_LABELS: Record<SortMode, string> = {
    recommended: t("products.sort_recommended"),
    "price-asc": t("products.sort_price_asc"),
    "price-desc": t("products.sort_price_desc"),
  };

  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: activeCategory,
      sort: sortMode,
      limit: 300,
      vendor: vendor || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, sortMode, vendor, minPrice, maxPrice]);

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
        <div className="products__filters">
          <div className="products__vendor-field">
            <input
              type="text"
              className="products__filter-input products__filter-input--vendor"
              placeholder={t("products.vendor_placeholder")}
              value={vendorInput}
              onChange={(e) => setVendorInput(e.target.value)}
              onFocus={() => setVendorDropdownOpen(true)}
              onBlur={() => setTimeout(() => setVendorDropdownOpen(false), 150)}
            />
            {vendorDropdownOpen && filteredVendors.length > 0 && (
              <ul className="products__vendor-dropdown">
                {filteredVendors.map((v) => (
                  <li key={v}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setVendorInput(v);
                        setVendorDropdownOpen(false);
                      }}
                    >
                      {v}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="products__price-range">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              className="products__filter-input products__filter-input--price"
              placeholder={t("products.min_price_placeholder")}
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
            />
            <span className="products__price-range-sep">–</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              className="products__filter-input products__filter-input--price"
              placeholder={t("products.max_price_placeholder")}
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
            />
          </div>
        </div>
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
