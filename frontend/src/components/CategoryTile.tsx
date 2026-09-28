import type { Category } from "../data/categories";
import "./CategoryTile.css";

export default function CategoryTile({ category }: { category: Category }) {
  return (
    <button className="category-tile" type="button">
      <span className="category-tile__glyph" style={{ background: category.bg }}>
        {category.glyph}
      </span>
      <span className="category-tile__label">{category.label}</span>
    </button>
  );
}
