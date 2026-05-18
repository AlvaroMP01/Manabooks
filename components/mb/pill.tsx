"use client";

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

/** MBPill — toggleable filter pill with active/inactive state and ink border. */

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> & {
  children: ReactNode;
  active?: boolean;
  color?: string;
  style?: CSSProperties;
};

export function MBPill({ children, active = false, color, className, style, ...rest }: Props) {
  const bg = active ? color || "#FF6FB5" : "#FFFCFE";
  const fg = active ? "#FFFCFE" : "#3B1F47";
  return (
    <button
      {...rest}
      className={`focus-visible:ring-mb-pink-deep focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none focus-visible:ring-offset-mb-cream${className ? ` ${className}` : ""}`}
      style={{
        padding: "8px 16px",
        borderRadius: 999,
        background: bg,
        color: fg,
        border: "2px solid #3B1F47",
        boxShadow: "2px 3px 0 #3B1F47",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transform: active ? "translateY(-1px)" : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
