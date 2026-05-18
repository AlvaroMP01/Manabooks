/** Full-area decorative background — polka dots + floating clouds, butterflies, sparkles, and diamond based on density. */

import { MBButterfly } from "@/components/mb/butterfly";
import { MBCloud } from "@/components/mb/cloud";
import { MBDiamond } from "@/components/mb/diamond";
import { MBSparkle } from "@/components/mb/sparkle";

type MBBgDecorDensity = "subtle" | "medium" | "maximalist";
type MBBgDecorPalette = "pink" | "cream" | "sky";

type MBBgDecorProps = {
  density?: MBBgDecorDensity;
  palette?: MBBgDecorPalette;
  children?: React.ReactNode;
  className?: string;
};

const BG_COLOR: Record<MBBgDecorPalette, string> = {
  pink: "#FBD3E9",
  cream: "#FFF1F8",
  sky: "#CDEDF6",
};

// Polka-dot overlay pattern (radial-gradient per MBDotBg from system.jsx)
const DOT_BG = "radial-gradient(#FFD0E7 1.5px, transparent 1.5px)";

export function MBBgDecor({
  density = "medium",
  palette = "pink",
  children,
  className,
}: MBBgDecorProps) {
  const showClouds = density !== "subtle";
  const showButterflies = density !== "subtle";

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        background: BG_COLOR[palette],
        overflow: "hidden",
      }}
    >
      {/* polka-dot overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: DOT_BG,
          backgroundSize: "22px 22px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />

      {showClouds && (
        <>
          <MBCloud
            width={260}
            color="var(--color-mb-sky)"
            style={{ position: "absolute", top: -40, left: -40 }}
          />
          <MBCloud
            width={200}
            color="var(--color-mb-cream)"
            style={{ position: "absolute", top: 60, right: -30 }}
          />
          <MBCloud
            width={180}
            color="var(--color-mb-pink-soft)"
            style={{ position: "absolute", bottom: -30, left: "30%" }}
          />
          <MBCloud
            width={240}
            color="var(--color-mb-sky)"
            style={{ position: "absolute", bottom: -50, right: -50 }}
          />
        </>
      )}

      {showButterflies && (
        <>
          <MBButterfly
            size={50}
            style={{
              position: "absolute",
              top: 120,
              left: "32%",
              transform: "rotate(-12deg)",
            }}
          />
          <MBButterfly
            size={36}
            style={{
              position: "absolute",
              bottom: 140,
              right: "24%",
              transform: "rotate(18deg)",
            }}
          />
        </>
      )}

      {density === "maximalist" && (
        <>
          <MBSparkle
            size={36}
            color="var(--color-mb-yellow)"
            style={{ position: "absolute", top: 80, left: "52%" }}
          />
          <MBSparkle
            size={22}
            color="var(--color-mb-pink-deep)"
            style={{ position: "absolute", bottom: 220, left: 80 }}
          />
          <MBDiamond
            size={56}
            style={{
              position: "absolute",
              top: 220,
              right: 60,
              transform: "rotate(12deg)",
            }}
          />
        </>
      )}

      {/* children render above decorations */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}
