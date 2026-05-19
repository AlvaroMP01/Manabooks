/** MBWordmark — "manabooks" in Pacifico with ink stroke, drop-shadow, and a small floating crown SVG. */

type Props = {
  size?: number;
  color?: string;
  sub?: boolean;
};

export function MBWordmark({ size = 36, color = "#FF3D9A", sub = true }: Props) {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        lineHeight: 1,
        paddingTop: size * 0.5,
      }}
    >
      {/* crown */}
      <svg
        aria-hidden="true"
        width={size * 0.8}
        height={size * 0.5}
        viewBox="0 0 40 24"
        style={{
          position: "absolute",
          top: -size * 0.05,
          left: size * 0.3,
          transform: "rotate(-8deg)",
        }}
      >
        <path
          d="M4 22 L8 6 L14 14 L20 4 L26 14 L32 6 L36 22 Z"
          fill="#FFD86B"
          stroke="#3B1F47"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="6" r="2.5" fill="#FF6FB5" stroke="#3B1F47" strokeWidth="1.5" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-curly)",
          fontSize: size,
          color,
          WebkitTextStroke: `2px #3B1F47`,
          paintOrder: "stroke fill",
          filter: `drop-shadow(2px 3px 0 #3B1F47)`,
        }}
      >
        manabooks
      </span>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-sticker)",
            fontSize: size * 0.22,
            color: "#3B1F47",
            letterSpacing: 4,
            marginTop: 2,
            textAlign: "right",
            paddingRight: 4,
          }}
        >
          · your reading era ·
        </div>
      )}
    </div>
  );
}
