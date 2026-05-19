"use client";

import { MBButton } from "@/components/mb/button";
import { MBSticker } from "@/components/mb/sticker";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grid place-items-center gap-5 py-16 text-center">
      <MBSticker color="#FF3D9A" rotate={-4} fontSize={28}>
        ups ✦
      </MBSticker>
      <p style={{ fontFamily: "var(--font-hand)", fontSize: 22, color: "#3B1F47" }}>
        algo se quemó en la imprenta, intentá de nuevo.
      </p>
      <MBButton color="pink" onClick={reset}>
        reintentar
      </MBButton>
    </div>
  );
}
