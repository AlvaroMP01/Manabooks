import { describe, expect, it } from "vitest";

import { computeProgressTransition, computeTimestamps } from "@/lib/library/transitions";

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

describe("computeProgressTransition", () => {
  it("to_read + currentPage=0 → no auto-transition, no prompt", () => {
    const result = computeProgressTransition({
      prevStatus: "to_read",
      currentPage: 0,
      totalPages: 200,
      currentStartedAt: null,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(false);
  });

  it("to_read + currentPage=5 + no existing startedAt → auto-transition to reading, sets startedAt to now", () => {
    const before = Date.now();
    const result = computeProgressTransition({
      prevStatus: "to_read",
      currentPage: 5,
      totalPages: 200,
      currentStartedAt: null,
    });
    const after = Date.now();
    expect(result.autoStatus).toBe("reading");
    expect(result.promptComplete).toBe(false);
    expect(result.startedAt).not.toBeNull();
    const ts = new Date(result.startedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it("to_read + currentPage=5 + existing startedAt → auto-transition to reading, preserves existing startedAt", () => {
    const result = computeProgressTransition({
      prevStatus: "to_read",
      currentPage: 5,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
    });
    expect(result.autoStatus).toBe("reading");
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.promptComplete).toBe(false);
  });

  it("reading + currentPage=50, totalPages=200 → no auto-transition, no prompt", () => {
    const result = computeProgressTransition({
      prevStatus: "reading",
      currentPage: 50,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(false);
  });

  it("reading + currentPage=totalPages → no auto-transition, promptComplete=true", () => {
    const result = computeProgressTransition({
      prevStatus: "reading",
      currentPage: 200,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(true);
  });

  it("read + currentPage=0 → no reverse transition, no prompt", () => {
    const result = computeProgressTransition({
      prevStatus: "read",
      currentPage: 0,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(false);
  });

  it("reading + totalPages=null + currentPage=999 → promptComplete=false (null totalPages never triggers prompt)", () => {
    const result = computeProgressTransition({
      prevStatus: "reading",
      currentPage: 999,
      totalPages: null,
      currentStartedAt: FIXED_TS,
    });
    expect(result.promptComplete).toBe(false);
    expect(result.autoStatus).toBeNull();
  });
});
