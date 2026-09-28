import type { PackageShape } from "../data/mockProducts";

const STROKE = {
  stroke: "#6E4B3E",
  strokeWidth: 3,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

export default function ProductArt({
  shape,
  color,
  label,
  name,
}: {
  shape: PackageShape;
  color: string;
  label: string;
  name: string;
}) {
  const textY = shape === "can" ? 123 : 121;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={name}>
      <rect width="200" height="200" fill={color} opacity="0.28" />
      <circle cx="160" cy="40" r="5" fill="#EACF78" />
      <circle cx="36" cy="160" r="4" fill="#A9CBC9" />
      <ellipse cx="100" cy="176" rx="62" ry="8" fill="#6E4B3E" opacity="0.12" />

      {shape === "can" && (
        <g fill="none">
          <ellipse cx="100" cy="150" rx="52" ry="14" fill={color} {...STROKE} />
          <rect x="48" y="82" width="104" height="68" fill={color} stroke="none" />
          <path d="M48 82v68 M152 82v68" {...STROKE} fill="none" />
          <ellipse cx="100" cy="82" rx="52" ry="14" fill="#FFF8E8" {...STROKE} />
          <ellipse
            cx="100"
            cy="82"
            rx="36"
            ry="8"
            fill="none"
            {...STROKE}
            strokeWidth={2}
          />
          <rect
            x="62"
            y="104"
            width="76"
            height="28"
            rx="8"
            fill="#FFF8E8"
            {...STROKE}
            strokeWidth={2}
          />
        </g>
      )}

      {shape === "box" && (
        <g fill="none">
          <path
            d="M50 70 L138 60 L152 72 L152 158 L64 166 L50 154 Z"
            fill={color}
            {...STROKE}
          />
          <path d="M50 70 L64 82 L152 72 M64 82 V166" fill="none" {...STROKE} />
          <rect
            x="76"
            y="100"
            width="62"
            height="32"
            rx="8"
            fill="#FFF8E8"
            {...STROKE}
            strokeWidth={2}
            transform="rotate(-4 107 116)"
          />
        </g>
      )}

      {shape === "bag" && (
        <g fill="none">
          <path
            d="M60 58 h80 l8 14 -4 94 q-44 10 -88 0 l-4 -94 z"
            fill={color}
            {...STROKE}
          />
          <path d="M58 72 h86" fill="none" {...STROKE} />
          <path d="M68 58 l4 -8 h56 l4 8" fill={color} {...STROKE} />
          <rect
            x="70"
            y="100"
            width="60"
            height="32"
            rx="8"
            fill="#FFF8E8"
            {...STROKE}
            strokeWidth={2}
          />
        </g>
      )}

      <text
        x="100"
        y={textY}
        textAnchor="middle"
        fontFamily="ZCOOL KuaiLe, sans-serif"
        fontSize={label.length > 3 ? 14 : 17}
        fill="#B8657F"
      >
        {label}
      </text>
    </svg>
  );
}
