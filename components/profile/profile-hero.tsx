import { MBSparkle } from "@/components/mb/sparkle";
import { MBSticker } from "@/components/mb/sticker";

interface ProfileHeroProps {
  initial: string;
  headline: string;
  email: string | null;
  showEmail: boolean;
}

/** ProfileHero — avatar + curly headline + sticker badge + optional email. Server component. */
export function ProfileHero({ initial, headline, email, showEmail }: ProfileHeroProps) {
  return (
    <header className="flex items-center gap-6">
      <div className="relative shrink-0">
        <div
          aria-hidden="true"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-mb-pink), var(--color-mb-purple))",
            border: "3px solid #3B1F47",
            boxShadow: "4px 5px 0 #3B1F47",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-curly)",
            fontSize: 64,
            color: "#FFFCFE",
            WebkitTextStroke: "2px #3B1F47",
            paintOrder: "stroke fill",
          }}
        >
          {initial}
        </div>
        <MBSparkle size={26} className="absolute -top-2 -right-2" />
        <MBSparkle size={18} color="var(--color-mb-purple)" className="absolute bottom-0 -left-3" />
      </div>

      <div className="min-w-0 flex-1">
        <MBSticker color="var(--color-mb-yellow)" fontSize={11} padding="3px 10px" rotate={-3}>
          ★ READER PRO
        </MBSticker>
        <h2
          style={{
            fontFamily: "var(--font-curly)",
            fontSize: 56,
            color: "#FF3D9A",
            margin: "8px 0 0",
            lineHeight: 0.95,
            WebkitTextStroke: "2.5px #3B1F47",
            paintOrder: "stroke fill",
            filter: "drop-shadow(3px 4px 0 #3B1F47)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={headline}
        >
          {headline}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-hand)",
            fontSize: 20,
            color: "#8B3FE0",
            margin: 0,
            marginTop: 6,
          }}
        >
          tu rincón de lectora ✦
        </p>
        {showEmail && email && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "#6E4A7A",
              margin: 0,
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={email}
          >
            {email}
          </p>
        )}
      </div>
    </header>
  );
}
