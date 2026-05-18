/** MBStatus — reading-state chip that accepts DB enum keys and renders localized labels. */

type DBStatus = "to_read" | "reading" | "read";

type Props = {
  status: DBStatus;
};

const STATUS_MAP = {
  to_read: { bg: "var(--color-mb-sky)", fg: "var(--color-mb-ink)", label: "por leer" },
  reading: { bg: "var(--color-mb-pink)", fg: "var(--color-mb-white)", label: "leyendo" },
  read: { bg: "var(--color-mb-mint)", fg: "var(--color-mb-ink)", label: "leído" },
} as const;

export function MBStatus({ status }: Props) {
  const c = STATUS_MAP[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        border: "1.6px solid #3B1F47",
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 0.3,
        textTransform: "lowercase",
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
