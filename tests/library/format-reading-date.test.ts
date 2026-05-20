import { describe, expect, it } from "vitest";

import { formatReadingDate } from "@/lib/library/utils";

describe("formatReadingDate", () => {
  it("returns null for null input", () => {
    expect(formatReadingDate(null)).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(formatReadingDate("not-a-date")).toBeNull();
  });

  it('formats valid ISO to "5 de mayo de 2026" in es-AR locale', () => {
    expect(formatReadingDate("2026-05-05T00:00:00.000Z")).toBe("5 de mayo de 2026");
  });

  it("is stable across calls (module-level formatter does not mutate)", () => {
    const first = formatReadingDate("2026-05-05T00:00:00.000Z");
    const second = formatReadingDate("2026-05-05T00:00:00.000Z");
    expect(first).toBe(second);
    expect(first).toBe("5 de mayo de 2026");
  });
});
