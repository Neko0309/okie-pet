import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !user.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="admin container">
      <h1 className="admin__title">Admin</h1>
      <nav className="admin__nav">
        <NavLink to="/admin/products" className={({ isActive }) => (isActive ? "is-active" : "")}>
          Products
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "is-active" : "")}>
          Orders
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
