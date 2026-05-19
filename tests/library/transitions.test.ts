import { describe, expect, it } from "vitest";

import { computeTimestamps } from "@/lib/library/transitions";

const FIXED_TS = "2026-01-01T00:00:00.000Z";

describe("computeTimestamps", () => {
  it("sets startedAt when transitioning to reading and startedAt is null", () => {
    const before = Date.now();
    const result = computeTimestamps("to_read", "reading", {
      startedAt: null,
      finishedAt: null,
    });
    const after = Date.now();

    expect(result.startedAt).not.toBeNull();
    const ts = new Date(result.startedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.finishedAt).toBeNull();
  });

  it("does NOT change startedAt when transitioning to reading and startedAt is already set", () => {
    const result = computeTimestamps("to_read", "reading", {
      startedAt: FIXED_TS,
      finishedAt: null,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
  });

  it("sets finishedAt when transitioning to read and finishedAt is null", () => {
    const before = Date.now();
    const result = computeTimestamps("reading", "read", {
      startedAt: FIXED_TS,
      finishedAt: null,
    });
    const after = Date.now();

    const ts = new Date(result.finishedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.startedAt).toBe(FIXED_TS);
  });

  it("does NOT change finishedAt when transitioning to read and finishedAt is already set", () => {
    const finishedTs = "2026-02-01T10:00:00.000Z";
    const result = computeTimestamps("reading", "read", {
      startedAt: FIXED_TS,
      finishedAt: finishedTs,
    });
    expect(result.finishedAt).toBe(finishedTs);
  });

  it("does NOT clear timestamps on reverse transition (read -> to_read)", () => {
    const result = computeTimestamps("read", "to_read", {
      startedAt: FIXED_TS,
      finishedAt: "2026-03-01T00:00:00.000Z",
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("does NOT clear timestamps on reverse transition (reading -> to_read)", () => {
    const result = computeTimestamps("reading", "to_read", {
      startedAt: FIXED_TS,
      finishedAt: null,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
  });

  it("to_read -> to_read keeps both null", () => {
    const result = computeTimestamps("to_read", "to_read", {
      startedAt: null,
      finishedAt: null,
    });
    expect(result.startedAt).toBeNull();
    expect(result.finishedAt).toBeNull();
  });
});
