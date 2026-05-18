/** Pastel cloud silhouette — used as floating background decoration in MBBgDecor. */

type MBCloudProps = {
  width?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
};

export function MBCloud({
  width = 200,
  color = "var(--color-mb-sky)",
  className,
  style,
}: MBCloudProps) {
  const height = width * 0.62;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 124"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M30 90 C10 90, 8 64, 28 60 C24 38, 54 28, 66 42 C72 22, 108 22, 116 42 C130 28, 160 38, 156 60 C176 64, 178 90, 158 90 Z"
        fill={color}
        stroke="var(--color-mb-ink)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
