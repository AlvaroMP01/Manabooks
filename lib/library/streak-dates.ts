/**
 * streak-dates — shared pure date helpers for reading-streak calculations.
 *
 * No `import "server-only"` here: this module is consumed both by the
 * server-only streak calculator (lib/library/streak.ts) and by a server
 * component (components/progress/progress-streak-summary.tsx), so it must
 * stay free of server-only side effects.
 */

export const STREAK_TIMEZONE = "Europe/Madrid";

/**
 * MAX_GAP_DAYS — the maximum number of calendar days between two adjacent
 * activity dates that still counts as "consecutive" for streak purposes.
 *
 * gap = 0 → same day (deduplicated, doesn't add to streak)
 * gap = 1 → consecutive days (continues)
 * gap = 2 → ONE day skipped (still continues per spec)
 * gap >= 3 → streak breaks
 *
 * Also applied to "today vs latest activity": if MORE than 2 days have passed
 * since the most recent activity, the streak is considered broken (returns 0).
 */
export const MAX_GAP_DAYS = 2;

/**
 * Normalize an ISO timestamp to a calendar date string (YYYY-MM-DD) in
 * STREAK_TIMEZONE (Europe/Madrid). Using a local timezone instead of UTC
 * avoids misattributing late-night reads (near local midnight) to the
 * previous day. `Intl.DateTimeFormat` handles the CET/CEST DST switch
 * automatically, and the "en-CA" locale formats dates as YYYY-MM-DD.
 */
export function toStreakDate(iso: string): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: STREAK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date(iso));
}

/**
 * Calendar days between two YYYY-MM-DD date strings.
 * Positive when laterDate > earlierDate; zero when same; negative if reversed.
 */
export function daysBetween(laterDate: string, earlierDate: string): number {
  const laterParts = laterDate.split("-");
  const earlierParts = earlierDate.split("-");
  const ly = Number(laterParts[0]);
  const lm = Number(laterParts[1]);
  const ld = Number(laterParts[2]);
  const ey = Number(earlierParts[0]);
  const em = Number(earlierParts[1]);
  const ed = Number(earlierParts[2]);
  const laterMs = Date.UTC(ly, lm - 1, ld);
  const earlierMs = Date.UTC(ey, em - 1, ed);
  return Math.round((laterMs - earlierMs) / 86_400_000); // 86_400_000 = ms in a day
}
