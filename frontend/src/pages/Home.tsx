import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CategoryTile from "../components/CategoryTile";
import ProductCard from "../components/ProductCard";
import { CATEGORIES } from "../data/categories";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import "./Home.css";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home">
      <div className="container">
        <div className="home__ribbon">
          <span>{t("home.ribbon_shipping")}</span>
          <span>{t("home.ribbon_delivery")}</span>
        </div>
      </div>

      <section className="home__hero container">
        <div>
          <h1 className="home__hero-title">
            {t("home.hero_title_line1")}
            <br />
            {t("home.hero_title_line2")}
          </h1>
          <p className="home__hero-sub">{t("home.hero_sub")}</p>
          <Link to="/products" className="home__hero-cta">
            {t("home.hero_cta")}
          </Link>
        </div>
        <div className="home__hero-art" aria-hidden="true">
          <ShopfrontArt />
        </div>
      </section>

      <div className="container">
        <div className="plaque">
          <h2>{t("home.categories_title")}</h2>
          <div className="doodle" />
        </div>
        <div className="home__categories">
          {CATEGORIES.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="plaque">
          <h2>{t("home.hot_products_title")}</h2>
          <div className="doodle" />
        </div>
        <div className="home__product-grid">
          {MOCK_PRODUCTS.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

function ShopfrontArt() {
  return (
    <svg viewBox="0 0 480 380" role="img" aria-label="Okie Pet 门店插画,猫咪和小狗从橱窗里探出头">
      <g fill="none" stroke="#6E4B3E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="240" cy="350" rx="200" ry="14" fill="#EADFC6" stroke="none" />
        <path d="M72 128 L408 128 L404 344 L76 346 Z" fill="#FFF8E8" />
        <rect x="150" y="18" width="180" height="52" rx="16" fill="#F4D7DC" />
        <text
          x="240"
          y="55"
          textAnchor="middle"
          fontFamily="Fredoka, sans-serif"
          fontSize="30"
          fontWeight="600"
          fill="#B8657F"
          stroke="none"
        >
          OKIE PET
        </text>
        <path d="M190 70 L186 92 M290 70 L294 92" />
        <path d="M56 92 L424 92 L424 136 L56 136 Z" fill="#F5E4A8" />
        <path
          d="M102 92v44 M148 92v44 M194 92v44 M240 92v44 M286 92v44 M332 92v44 M378 92v44"
          stroke="#F4D7DC"
          strokeWidth="22"
        />
        <path d="M56 92 L424 92 L424 136 L56 136 Z" />
        <path
          d="M56 136 q23 26 46 0 q23 26 46 0 q23 26 46 0 q23 26 46 0 q23 26 46 0 q23 26 46 0 q23 26 46 0 q23 26 46 0"
          fill="#F5E4A8"
        />
        <rect x="102" y="186" width="180" height="128" rx="12" fill="#E3EFEE" />
        <path d="M132 262 l6 -34 l18 20 M196 262 l-6 -34 l-18 20" fill="#F6D9A8" />
        <ellipse cx="164" cy="274" rx="38" ry="32" fill="#F6D9A8" />
        <path d="M150 262 q-6 -4 -12 0 M180 262 q6 -4 12 0" strokeWidth="2.5" />
        <circle cx="152" cy="274" r="3.2" fill="#6E4B3E" />
        <circle cx="176" cy="274" r="3.2" fill="#6E4B3E" />
        <path d="M160 284 q4 4 8 0" strokeWidth="2.5" />
        <ellipse cx="142" cy="286" rx="6" ry="3.5" fill="#F4B5C0" stroke="none" />
        <ellipse cx="186" cy="286" rx="6" ry="3.5" fill="#F4B5C0" stroke="none" />
        <ellipse cx="240" cy="276" rx="34" ry="30" fill="#EFB77A" />
        <path
          d="M210 262 q-18 6 -12 34 q12 2 16 -14 M270 262 q18 6 12 34 q-12 2 -16 -14"
          fill="#C98A4E"
        />
        <ellipse cx="240" cy="290" rx="16" ry="12" fill="#FFF8E8" />
        <circle cx="228" cy="272" r="3.2" fill="#6E4B3E" />
        <circle cx="252" cy="272" r="3.2" fill="#6E4B3E" />
        <ellipse cx="240" cy="284" rx="5" ry="3.5" fill="#6E4B3E" />
        <path d="M240 288 v5 q-5 5 -9 0 M240 293 q5 5 9 0" strokeWidth="2.5" />
        <path d="M102 314 h180" strokeWidth="5" />
        <path d="M310 344 V214 q0 -24 30 -24 q30 0 30 24 V344" fill="#F4D7DC" />
        <circle cx="358" cy="276" r="4" fill="#6E4B3E" />
        <path d="M324 228 h32 v36 h-32 z" fill="#E3EFEE" />
        <path d="M396 344 l4 -40 h34 l4 40 z" fill="#A9CBC9" />
        <path d="M408 304 q9 -16 18 0" />
        <path d="M412 324 q5 -6 10 0 q5 -6 10 0 l-10 10 z" fill="#F4B5C0" strokeWidth="2" />
      </g>
      <g fill="#EACF78">
        <path d="M40 60 l5 14 14 5 -14 5 -5 14 -5 -14 -14 -5 14 -5z" />
        <path d="M438 44 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" />
        <path d="M446 190 l4 11 11 4 -11 4 -4 11 -4 -11 -11 -4 11 -4z" />
      </g>
    </svg>
  );
}
