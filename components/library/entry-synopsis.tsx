import { MBCard } from "@/components/mb/card";

export function EntrySynopsis({ synopsis }: { synopsis: string | null }) {
  if (!synopsis) return null;

  return (
    <MBCard color="#FFFCFE" className="flex flex-col gap-2 p-6">
      <h2 style={{ fontFamily: "var(--font-curly)", fontSize: 24, color: "#FF3D9A", margin: 0 }}>
        sinopsis
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          color: "#3B1F47",
          lineHeight: 1.55,
          whiteSpace: "pre-wrap",
        }}
      >
        {synopsis}
      </p>
    </MBCard>
  );
}
