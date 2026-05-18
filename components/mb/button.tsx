"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

/** MBButton — primary CTA pill button with ink border, offset shadow, and sticker font. */

type Size = "sm" | "md" | "lg";
type Color = "pink" | "purple" | "yellow" | "white";

const colorMap: Record<Color, { bg: string; fg: string }> = {
  pink: { bg: "#FF6FB5", fg: "#FFFCFE" },
  purple: { bg: "#B967FF", fg: "#FFFCFE" },
  yellow: { bg: "#FFD86B", fg: "#3B1F47" },
  white: { bg: "#FFFCFE", fg: "#3B1F47" },
};

const sizeMap: Record<Size, { font: number; pad: string }> = {
  sm: { font: 13, pad: "8px 14px" },
  md: { font: 15, pad: "12px 22px" },
  lg: { font: 18, pad: "14px 28px" },
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  children: ReactNode;
  color?: Color;
  size?: Size;
  style?: CSSProperties;
};

export function MBButton({
  children,
  color = "pink",
  size = "md",
  className,
  style,
  ...rest
}: Props) {
  const c = colorMap[color];
  const s = sizeMap[size];
  return (
    <button
      {...rest}
      className={`focus-visible:ring-mb-pink-deep focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-offset-mb-cream${className ? ` ${className}` : ""}`}
      style={{
        padding: s.pad,
        background: c.bg,
        color: c.fg,
        border: "2.5px solid #3B1F47",
        borderRadius: 999,
        boxShadow: "3px 4px 0 #3B1F47",
        fontFamily: "var(--font-sticker)",
        fontSize: s.font,
        fontWeight: 400,
        letterSpacing: 0.4,
        cursor: "pointer",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
