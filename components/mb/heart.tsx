/** Solid heart with thick ink outline — used in ratings, decor, and progress caps. */

type MBHeartProps = {
  size?: number;
  color?: string;
  outline?: string;
  className?: string;
};

export function MBHeart({
  size = 24,
  color = "var(--color-mb-pink)",
  outline = "var(--color-mb-ink)",
  className,
}: MBHeartProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 21s-7.5-4.6-9.5-9.5C1 7.5 3.5 4 7 4c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.5 0 6 3.5 4.5 7.5C19.5 16.4 12 21 12 21Z"
        fill={color}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
