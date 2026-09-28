import { NavLink } from "react-router-dom";
import SearchBar from "./SearchBar";
import "./TopNav.css";

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav__inner container">
        <NavLink to="/" end className="top-nav__logo">
          Okie Pet
        </NavLink>

        <nav className="top-nav__links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            首页
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? "is-active" : "")}
          >
            商品
          </NavLink>
        </nav>

        <div className="top-nav__search">
          <SearchBar />
        </div>

        <div className="top-nav__actions">
          <NavLink
            to="/cart"
            aria-label="购物车"
            className={({ isActive }) =>
              "top-nav__icon-link" + (isActive ? " is-active" : "")
            }
          >
            <CartIcon />
          </NavLink>
          <NavLink
            to="/account"
            aria-label="个人中心"
            className={({ isActive }) =>
              "top-nav__icon-link" + (isActive ? " is-active" : "")
            }
          >
            <UserIcon />
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
      <path
        d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20.5" r="1.4" fill="currentColor" />
      <circle cx="17" cy="20.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M4.5 20c1.4-3.6 4.3-5.4 7.5-5.4s6.1 1.8 7.5 5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
