import { MBHeart } from "./heart";

/** MBProgress — bubbly progress bar with gradient fill and yellow heart cap at leading edge. */

type Props = {
  value?: number;
  max?: number;
  height?: number;
  color?: string;
};

export function MBProgress({
  value = 0,
  max = 100,
  height = 14,
  color = "var(--color-mb-pink)",
}: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      style={{
        position: "relative",
        width: "100%",
        height,
        background: "#FFFCFE",
        border: "2px solid #3B1F47",
        borderRadius: 999,
        overflow: "visible",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0 auto 0 0",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, #B967FF)`,
          borderRadius: 999,
          borderRight: pct > 2 ? "2px solid #3B1F47" : "none",
        }}
      />
      {pct > 3 && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct}%`,
            transform: "translate(-60%, -50%)",
          }}
        >
          <MBHeart size={height + 10} color="#FFD86B" />
        </span>
      )}
    </div>
  );
}
