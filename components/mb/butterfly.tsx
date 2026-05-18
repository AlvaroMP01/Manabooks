/** Butterfly decoration — purple upper wings, yellow lower wings, ink body and antennae. */

type MBButterflyProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function MBButterfly({ size = 40, className, style }: MBButterflyProps) {
  return (
    <svg
      width={size}
      height={size * 0.85}
      viewBox="0 0 48 40"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g stroke="var(--color-mb-ink)" strokeWidth="1.6" strokeLinejoin="round">
        <path
          d="M24 8 C18 2, 8 2, 5 8 C2 14, 6 20, 12 20 C18 20, 22 16, 24 12 Z"
          fill="var(--color-mb-purple)"
        />
        <path
          d="M24 12 C22 20, 16 32, 10 32 C5 32, 4 26, 8 22 C12 18, 20 18, 24 20 Z"
          fill="var(--color-mb-yellow)"
        />
        <path
          d="M24 8 C30 2, 40 2, 43 8 C46 14, 42 20, 36 20 C30 20, 26 16, 24 12 Z"
          fill="var(--color-mb-purple)"
        />
        <path
          d="M24 12 C26 20, 32 32, 38 32 C43 32, 44 26, 40 22 C36 18, 28 18, 24 20 Z"
          fill="var(--color-mb-yellow)"
        />
        <path d="M24 7 L24 28" fill="none" />
        <circle cx="24" cy="6" r="2" fill="var(--color-mb-ink)" />
        <path d="M24 5 C22 2 20 1 19 0 M24 5 C26 2 28 1 29 0" fill="none" />
      </g>
    </svg>
  );
}
