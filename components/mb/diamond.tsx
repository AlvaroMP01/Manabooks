/** Gem diamond decoration — purple front face with purpleDeep inner shadow, ink outline. */

type MBDiamondProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function MBDiamond({ size = 60, className, style }: MBDiamondProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g stroke="var(--color-mb-ink)" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M12 22 L30 8 L48 22 L30 56 Z" fill="var(--color-mb-purple)" />
        <path d="M12 22 L30 22 L30 56 Z" fill="var(--color-mb-purple-deep)" opacity="0.4" />
        <path d="M12 22 L20 8 L40 8 L48 22" fill="none" />
        <path d="M20 8 L24 22 L30 8 M30 8 L36 22 L40 8" fill="none" />
      </g>
    </svg>
  );
}
