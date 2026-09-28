import { useEffect, useRef, useState } from "react";
import type { SortMode } from "../lib/products";
import "./SortDropdown.css";

const OPTIONS: SortMode[] = ["recommended", "price-asc", "price-desc"];

export default function SortDropdown({
  value,
  onChange,
  labels,
  prefixLabel,
}: {
  value: SortMode;
  onChange: (mode: SortMode) => void;
  labels: Record<SortMode, string>;
  prefixLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="sort-dropdown" ref={rootRef}>
      <button
        type="button"
        className="sort-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {prefixLabel}
        {labels[value]}
        <span className={"sort-dropdown__caret" + (open ? " is-open" : "")}>▾</span>
      </button>

      {open && (
        <ul className="sort-dropdown__menu" role="listbox">
          {OPTIONS.map((mode) => (
            <li key={mode}>
              <button
                type="button"
                role="option"
                aria-selected={mode === value}
                className={
                  "sort-dropdown__option" + (mode === value ? " is-selected" : "")
                }
                onClick={() => {
                  onChange(mode);
                  setOpen(false);
                }}
              >
                {labels[mode]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
