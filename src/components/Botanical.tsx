/**
 * Decorative botanical leaf branch — pure SVG so it stays crisp at any size.
 * Modeled on the leaf sprigs in the design mockup (home-page-final draft.png).
 *
 *  - variant="solid" → filled leaves (use in cream sections, tinted sage)
 *  - variant="line"  → thin line-art outline (use on navy bands, tinted gold)
 *
 * Color follows `currentColor`, so tint via a text-* class on the element.
 */
type BotanicalProps = {
  variant?: "solid" | "line";
  className?: string;
};

/** Leaf positions along the stem: [x, y, rotationDeg, scale]. */
const LEAVES: [number, number, number, number][] = [
  [60, 38, -38, 1.0],
  [54, 72, 150, 0.9],
  [66, 104, -32, 1.08],
  [52, 140, 162, 0.95],
  [68, 174, -26, 1.12],
  [50, 210, 166, 0.9],
  [64, 244, -30, 1.02],
  [56, 278, 150, 0.85],
  [60, 306, -12, 0.78],
];

const LEAF_PATH = "M0 0 C 8 -11 26 -11 34 0 C 26 11 8 11 0 0 Z";

/** Positions for the ornate branch: [x, y, rotationDeg, scale]. */
const ORNATE_LEAVES: [number, number, number, number][] = [
  [118, 48, -52, 1.0],
  [92, 96, 150, 0.95],
  [128, 122, -46, 1.12],
  [86, 168, 158, 1.02],
  [122, 196, -42, 1.18],
  [78, 244, 160, 1.06],
  [112, 272, -46, 1.12],
  [72, 320, 158, 1.0],
  [100, 348, -40, 1.0],
  [72, 392, 155, 0.9],
  [94, 418, -30, 0.82],
];

const ORNATE_LEAF = "M0 0 C 11 -17 36 -17 48 0 C 36 17 11 17 0 0 Z";

/**
 * Ornate, clearly-visible leaf branch (thicker strokes + soft fill).
 * Modeled on the gold botanicals flanking the "Rooted in Values" band.
 * Tint via a text-* class; color follows currentColor.
 */
export function GoldBranch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 460"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* stem */}
      <path
        d="M126 18 C 96 88 132 160 100 236 C 76 300 104 370 82 446"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeOpacity={0.9}
      />
      {ORNATE_LEAVES.map(([x, y, r, s], i) => {
        const t = `translate(${x} ${y}) rotate(${r}) scale(${s})`;
        return (
          <g key={i} transform={t}>
            {/* stalk into stem */}
            <path
              d="M0 0 L -10 0"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeOpacity={0.9}
            />
            <path
              d={ORNATE_LEAF}
              fill="currentColor"
              fillOpacity={0.16}
              stroke="currentColor"
              strokeWidth={2}
            />
            {/* midrib */}
            <path
              d="M2 0 L 44 0"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeOpacity={0.85}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function LeafBranch({ variant = "solid", className }: BotanicalProps) {
  const line = variant === "line";
  return (
    <svg
      viewBox="0 0 120 330"
      fill="none"
      aria-hidden
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* stem */}
      <path
        d="M60 18 C 54 90 66 158 58 238 C 54 284 60 306 60 322"
        fill="none"
        stroke="currentColor"
        strokeWidth={line ? 1 : 1.4}
        strokeLinecap="round"
        strokeOpacity={line ? 0.85 : 0.7}
      />
      {/* leaves + midribs */}
      {LEAVES.map(([x, y, r, s], i) => {
        const t = `translate(${x} ${y}) rotate(${r}) scale(${s})`;
        return line ? (
          <g key={i} transform={t}>
            <path
              d={LEAF_PATH}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.1}
            />
            <path
              d="M0 0 L 30 0"
              stroke="currentColor"
              strokeWidth={0.8}
              strokeOpacity={0.7}
            />
          </g>
        ) : (
          <path
            key={i}
            d={LEAF_PATH}
            transform={t}
            fill="currentColor"
            fillOpacity={0.85}
          />
        );
      })}
    </svg>
  );
}
