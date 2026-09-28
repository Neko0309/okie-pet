import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryTile from "../components/CategoryTile";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../data/categories";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <header className="home__header">
        <div className="home__brand">Okie Pet</div>
        <SearchBar />
      </header>

      <section className="home__hero">
        <p className="home__hero-eyebrow">墨尔本本地宠物用品</p>
        <h1 className="home__hero-title">OKIE PET</h1>
        <p className="home__hero-sub">新鲜冻干 · 放心主粮 · 当日达</p>
      </section>

      <Link to="/products" className="home__promo">
        全澳满 $169 包邮 · 墨尔本当日配送
      </Link>

      <section className="home__section">
        <h2 className="home__section-title">店铺分类</h2>
        <div className="home__categories">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </section>

      <div className="home__banner">热门产品</div>

      <section className="home__section">
        <h2 className="home__section-title">新品上架</h2>
        <div className="home__product-grid">
          {MOCK_PRODUCTS.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
