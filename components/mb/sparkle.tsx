/** 4-point star sparkle — optional twinkle animation that respects prefers-reduced-motion via mb-twinkle class. */

import { cn } from "@/lib/utils";

type MBSparkleProps = {
  size?: number;
  color?: string;
  twinkle?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function MBSparkle({
  size = 24,
  color = "var(--color-mb-yellow)",
  twinkle = true,
  className,
  style,
}: MBSparkleProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(twinkle && "mb-twinkle", className)}
      style={{ filter: "drop-shadow(0 1px 0 rgb(122 42 96 / 0.25))", ...style }}
      aria-hidden="true"
    >
      <path
        d="M12 0 L13.6 9.4 L24 12 L13.6 14.6 L12 24 L10.4 14.6 L0 12 L10.4 9.4 Z"
        fill={color}
        stroke="var(--color-mb-ink)"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
