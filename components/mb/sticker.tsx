import type { CSSProperties, ReactNode } from "react";

/** MBSticker — text label with thick outline border, offset ink shadow, and optional rotation. */

type Shape = "rounded" | "pill" | "oval";
type FontAlias = "curly" | "sticker" | "body" | "hand";

type Props = {
  children: ReactNode;
  color?: string;
  outline?: string;
  ink?: string;
  fontSize?: number;
  font?: FontAlias;
  padding?: string;
  rotate?: number;
  shape?: Shape;
  className?: string;
  style?: CSSProperties;
};

const fontVar: Record<FontAlias, string> = {
  curly: "var(--font-curly)",
  sticker: "var(--font-sticker)",
  body: "var(--font-body)",
  hand: "var(--font-hand)",
};

export function MBSticker({
  children,
  color = "var(--color-mb-pink)",
  outline = "var(--color-mb-white)",
  ink = "var(--color-mb-ink)",
  fontSize = 32,
  font = "sticker",
  padding = "6px 16px",
  rotate = 0,
  shape = "rounded",
  className,
  style,
}: Props) {
  const radius = shape === "pill" ? 999 : shape === "oval" ? "50%" : 14;
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        position: "relative",
        padding,
        background: color,
        color: ink,
        fontFamily: fontVar[font],
        fontSize,
        fontWeight: 700,
        lineHeight: 1,
        borderRadius: radius,
        border: `3px solid ${outline}`,
        boxShadow: `0 0 0 2px ${ink}, 4px 5px 0 0 ${ink}`,
        transform: `rotate(${rotate}deg)`,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
