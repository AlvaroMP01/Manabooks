/**
 * Strip HTML tags and decode common entities from a Google Books description.
 * Returns null for null/undefined/empty/whitespace-only input.
 * Invariant: the output is plain text — safe to render inside <p>{value}</p>.
 * Never use the result with dangerouslySetInnerHTML.
 */
export function stripHtml(input: string | null | undefined): string | null {
  if (input == null) return null;
  const stripped = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&") // MUST be last — avoids double-decoding &amp;lt; etc.
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length === 0 ? null : stripped;
}
