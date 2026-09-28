import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Category } from "../data/categories";
import "./CategoryTile.css";

const STROKE = {
  stroke: "#6E4B3E",
  strokeWidth: 2.5,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
  fill: "none",
};

const ICONS: Record<string, ReactNode> = {
  "freeze-dried": (
    <g {...STROKE}>
      <path
        d="M34 34h40l6 10-4 48q-22 6-44 0l-4-48z"
        fill="#D6E6EF"
      />
      <path d="M60 26h30l4 10-2 40q-10 4-20 2" fill="#F5E4A8" />
      <rect x="44" y="58" width="20" height="14" rx="3" fill="#F7C47E" />
      <rect x="26" y="86" width="12" height="8" rx="3" fill="#F7C47E" />
    </g>
  ),
  supplies: (
    <g {...STROKE}>
      <path d="M44 44h40v50H44z" fill="#D6E6EF" />
      <path d="M54 44q10-22 20 0" />
      <path d="M60 64q4-6 8 0q4-6 8 0l-8 10z" fill="#F4B5C0" />
      <rect x="26" y="58" width="12" height="36" rx="4" fill="#F5E4A8" />
      <path d="M30 58v-8h6v8" />
    </g>
  ),
  canned: (
    <g {...STROKE}>
      <ellipse cx="46" cy="90" rx="22" ry="6" fill="#D6E6EF" />
      <path d="M24 64v26h44V64" fill="#D6E6EF" />
      <ellipse cx="46" cy="64" rx="22" ry="6" fill="#FFF8E8" />
      <path d="M36 76q8-6 16 0q-8 6-16 0z M52 76l6-4v8z" fill="#F7C47E" />
      <rect x="66" y="30" width="30" height="62" rx="8" fill="#DCCBE6" />
      <path d="M76 50l10 8 M84 48l-6 12" />
    </g>
  ),
  staple: (
    <g {...STROKE}>
      <path d="M26 40h34l4 54H22z" fill="#F5E4A8" />
      <path d="M56 34h34l4 60H60z" fill="#F7D6A6" />
      <text
        x="42"
        y="70"
        fontSize="11"
        textAnchor="middle"
        fill="#6E4B3E"
        stroke="none"
        fontFamily="Fredoka"
      >
        CAT
      </text>
      <text
        x="76"
        y="68"
        fontSize="11"
        textAnchor="middle"
        fill="#6E4B3E"
        stroke="none"
        fontFamily="Fredoka"
      >
        DOG
      </text>
      <path d="M48 96q12-10 24 0z" fill="#D6E6EF" />
    </g>
  ),
  snacks: (
    <g {...STROKE}>
      <path
        d="M34 36h52l4 12-2 44q-28 8-56 0l-2-44z"
        fill="#FFF8E8"
      />
      <rect x="48" y="28" width="24" height="10" rx="3" fill="#F4B5C0" />
      <path d="M44 60h8 M60 70l8 6 M50 80l6-4" stroke="#F4B5C0" strokeWidth="6" />
      <circle cx="72" cy="58" r="5" fill="#A9CBC9" stroke="none" />
      <circle cx="44" cy="74" r="4" fill="#F5E4A8" stroke="none" />
    </g>
  ),
  deals: (
    <g {...STROKE}>
      <path d="M58 30h34l4 64H54z" fill="#F5E4A8" />
      <text
        x="75"
        y="66"
        fontSize="14"
        textAnchor="middle"
        fill="#6E4B3E"
        stroke="none"
        fontFamily="Fredoka"
      >
        GO!
      </text>
      <path d="M26 70h22l-3 24H29z" fill="#D6E6EF" />
      <path
        d="M30 70q-6-20 4-26 M37 70q0-24 6-28 M44 70q6-18 4-22"
        stroke="#9CC49A"
      />
    </g>
  ),
};

export default function CategoryTile({ category }: { category: Category }) {
  const { t } = useTranslation();
  return (
    <Link className="category-tile" to={`/products?cat=${category.id}`}>
      <div className="category-tile__blob">
        <svg viewBox="0 0 120 110" aria-hidden="true">
          <path
            d="M20 30q10-24 40-20q34-6 44 20q14 30-6 52q-20 22-50 16q-30-4-34-32q-4-20 6-36z"
            fill="#F4D7DC"
            opacity=".55"
          />
          {ICONS[category.id]}
        </svg>
      </div>
      <span className="category-tile__label">{t(`category.${category.id}`)}</span>
    </Link>
  );
}
