/** Bow ribbon decoration — two pink wings, center knot ellipse, dangling ribbon tails. */

type MBBowProps = {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function MBBow({ size = 36, color = "var(--color-mb-pink)", className, style }: MBBowProps) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 48 34"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g stroke="var(--color-mb-ink)" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M24 18 C18 8, 6 6, 4 14 C2 22, 14 26, 24 18 Z" fill={color} />
        <path d="M24 18 C30 8, 42 6, 44 14 C46 22, 34 26, 24 18 Z" fill={color} />
        <ellipse cx="24" cy="18" rx="4" ry="6" fill={color} />
        <path d="M22 23 L18 32 M26 23 L30 32" fill="none" />
      </g>
    </svg>
  );
}
