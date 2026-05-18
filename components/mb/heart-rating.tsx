"use client";

import { MBHeart } from "./heart";

/** MBHeartRating — interactive row of heart icons for rating display and input. */

type Props = {
  value?: number;
  max?: number;
  size?: number;
  onChange?: (value: number) => void;
  color?: string;
};

export function MBHeartRating({
  value = 0,
  max = 5,
  size = 22,
  onChange,
  color = "var(--color-mb-pink)",
}: Props) {
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          onClick={onChange ? () => onChange(i + 1) : undefined}
          style={{ cursor: onChange ? "pointer" : "default" }}
        >
          <MBHeart
            size={size}
            color={i < value ? color : "#FFFCFE"}
            outline="var(--color-mb-ink)"
          />
        </span>
      ))}
    </div>
  );
}
