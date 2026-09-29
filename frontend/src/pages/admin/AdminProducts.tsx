import { useEffect, useRef, useState } from "react";
import {
  exportAdminProducts,
  fetchAdminProducts,
  importAdminProducts,
  type AdminProduct,
} from "../../lib/admin";
import AdminProductModal from "./AdminProductModal";
import "./AdminProducts.css";

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load() {
    setLoading(true);
    fetchAdminProducts({ search: search || undefined, limit: 100 })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }

  async function handleExport() {
    setExporting(true);
    try {
      await exportAdminProducts();
    } catch {
      setImportMessage("Export failed.");
    } finally {
      setExporting(false);
    }
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImporting(true);
    setImportMessage(null);
    try {
      const result = await importAdminProducts(file);
      setImportMessage(
        `Imported ${result.total_rows} rows: ${result.created} created, ` +
          `${result.updated} updated, ${result.deactivated} deactivated.`,
      );
      load();
    } catch {
      setImportMessage("Import failed — check the file matches the expected format.");
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleSaved(updated: AdminProduct) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(updated);
  }

  return (
    <div className="admin-products">
      <div className="admin-products__toolbar">
        <input
          className="admin-products__search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-products__io">
          <button type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? "Exporting…" : "Export .xlsx"}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? "Importing…" : "Import .xlsx"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importMessage && <p className="admin-products__import-message">{importMessage}</p>}

      {!loading && (
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={p.is_active ? "" : "is-inactive"}>
                <td>
                  <div className="admin-table__thumb">
                    {p.image_url ? <img src={p.image_url} alt={p.name} /> : "🐾"}
                  </div>
                </td>
                <td className="admin-table__name">
                  {p.name}
                  {p.variants.length > 0 && (
                    <span className="admin-table__variant-count">
                      {p.variants.length} variants
                    </span>
                  )}
                </td>
                <td>{p.category}</td>
                <td>${Number(p.price).toFixed(2)}</td>
                <td>{p.stock_quantity}</td>
                <td>
                  <span className={"admin-badge" + (p.is_active ? " is-active" : "")}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button type="button" onClick={() => setEditing(p)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <AdminProductModal
          key={editing.id}
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
