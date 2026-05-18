import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/** MBCard — soft container with ink border and optional offset shadow. */

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  color?: string;
  outline?: string;
  radius?: number;
  shadow?: boolean;
  style?: CSSProperties;
};

export function MBCard({
  children,
  color = "var(--color-mb-white)",
  outline = "var(--color-mb-ink)",
  radius = 22,
  shadow = true,
  className,
  style,
  ...rest
}: Props) {
  return (
    <div
      className={className}
      style={{
        background: color,
        borderRadius: radius,
        border: `2px solid ${outline}`,
        boxShadow: shadow ? `4px 5px 0 0 ${outline}` : "none",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
