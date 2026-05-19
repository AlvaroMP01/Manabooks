import type { CSSProperties } from "react";

import { seedBookCoverPalette } from "@/lib/library/utils";

/** MBBookCover — decorative book cover placeholder with deterministic palette seeding from title. */

type Props = {
  title?: string;
  author?: string;
  color?: string;
  width?: number;
  height?: number;
  tilt?: number;
  thumbnail?: string | null;
  className?: string;
  style?: CSSProperties;
};

export function MBBookCover({
  title = "Book",
  author = "",
  color,
  width = 110,
  height = 165,
  tilt = 0,
  thumbnail,
  className,
  style,
}: Props) {
  const c: readonly [string, string, string] = color
    ? [color, "#FFD0E7", "#FFD86B"]
    : seedBookCoverPalette(title);

  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: "4px 12px 12px 4px",
        border: "2px solid #3B1F47",
        boxShadow: "3px 4px 0 #3B1F47",
        overflow: "hidden",
        position: "relative",
        background: c[0],
        transform: `rotate(${tilt}deg)`,
        flexShrink: 0,
        ...style,
      }}
    >
      {thumbnail ? (
        // Real Google Books cover — keep the MB frame, drop the decorative overlays.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbnail}
          alt=""
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <>
          {/* spine */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 6,
              background: "rgba(0,0,0,0.18)",
            }}
          />
          {/* decorative stripes */}
          <div
            style={{
              position: "absolute",
              inset: "40% 0 0 8px",
              background: `repeating-linear-gradient(135deg, ${c[1]} 0 14px, ${c[2]} 14px 28px)`,
              clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
              opacity: 0.85,
            }}
          />
          {/* title */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              right: 10,
              fontFamily: "var(--font-sticker)",
              color: "#3B1F47",
              fontSize: width > 90 ? 16 : 12,
              lineHeight: 1.05,
              textTransform: "uppercase",
              letterSpacing: 0.4,
            }}
          >
            {title}
          </div>
          {/* author */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 14,
              right: 10,
              fontFamily: "var(--font-hand)",
              color: "#3B1F47",
              fontSize: width > 90 ? 14 : 11,
              fontWeight: 600,
            }}
          >
            {author}
          </div>
        </>
      )}
    </div>
  );
}
