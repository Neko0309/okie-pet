import "./SearchBar.css";

export default function SearchBar({
  placeholder = "搜索宠物用品",
}: {
  placeholder?: string;
}) {
  return (
    <div className="search-bar">
      <svg viewBox="0 0 24 24" width="17" height="17" fill="none">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="m20 20-3.8-3.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <input type="text" placeholder={placeholder} />
    </div>
  );
}
