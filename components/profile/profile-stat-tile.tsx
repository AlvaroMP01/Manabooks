import { MBCard } from "@/components/mb/card";

interface ProfileStatTileProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  valueFontSize?: number;
}

/** ProfileStatTile — single dt/dd tile inside the profile stats grid. Server component. */
export function ProfileStatTile({
  label,
  value,
  icon,
  color,
  valueFontSize = 48,
}: ProfileStatTileProps) {
  return (
    <MBCard color={color} radius={20} className="relative px-4 py-4">
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontFamily: "var(--font-sticker)",
          fontSize: 20,
          color: "#3B1F47",
        }}
      >
        {icon}
      </span>
      <dt
        style={{
          fontFamily: "var(--font-sticker)",
          fontSize: 10,
          color: "#3B1F47",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          margin: 0,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          fontFamily: "var(--font-curly)",
          fontSize: valueFontSize,
          color: "#3B1F47",
          lineHeight: 1,
          WebkitTextStroke: "1.8px #3B1F47",
          paintOrder: "stroke fill",
          marginTop: 4,
          marginBottom: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </dd>
    </MBCard>
  );
}
