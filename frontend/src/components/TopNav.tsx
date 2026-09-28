import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchBar from "./SearchBar";
import LanguageSwitcher from "./LanguageSwitcher";
import { CATEGORIES } from "../data/categories";
import "./TopNav.css";

export default function TopNav() {
  const { t } = useTranslation();

  return (
    <>
      <header className="top-nav">
        <div className="top-nav__inner container">
          <Link to="/" className="top-nav__logo">
            <PawIcon />
            Okie Pet
          </Link>

          <div className="top-nav__search">
            <SearchBar />
          </div>

          <div className="top-nav__actions">
            <LanguageSwitcher />
            <NavLink
              to="/account"
              className={({ isActive }) =>
                "top-nav__icon-link" + (isActive ? " is-active" : "")
              }
            >
              <UserIcon />
              <span className="top-nav__icon-label">{t("nav.account")}</span>
            </NavLink>
            <NavLink
              to="/cart"
              className={({ isActive }) =>
                "top-nav__icon-link" + (isActive ? " is-active" : "")
              }
            >
              <CartIcon />
              <span className="top-nav__icon-label">{t("nav.cart")}</span>
              <span className="top-nav__badge">0</span>
            </NavLink>
          </div>
        </div>
      </header>

      <nav className="cat-nav" aria-label={t("home.categories_title")}>
        <div className="cat-nav__inner container">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            {t("nav.home")}
          </NavLink>
          <NavLink
            to="/products"
            end
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            {t("nav.all")}
          </NavLink>
          {CATEGORIES.map((c) => (
            <Link key={c.id} to={`/products?cat=${c.id}`}>
              {t(`category.${c.id}`)}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

function PawIcon() {
  return (
    <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true">
      <g fill="currentColor">
        <ellipse cx="20" cy="26" rx="9" ry="7.5" />
        <circle cx="9" cy="16" r="4" />
        <circle cx="16" cy="9" r="4" />
        <circle cx="24" cy="9" r="4" />
        <circle cx="31" cy="16" r="4" />
      </g>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
      <path
        d="M3 4h2.5l2.2 11h10.6L20.5 7H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="19.5" r="1.5" fill="currentColor" />
      <circle cx="17" cy="19.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
