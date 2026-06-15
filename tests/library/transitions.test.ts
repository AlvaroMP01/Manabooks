import { describe, expect, it } from "vitest";

import {
  computeProgressTransition,
  computeStatusChange,
  shouldBumpProgressTimestamp,
} from "@/lib/library/transitions";

const FIXED_TS = "2026-01-01T00:00:00.000Z";

describe("computeStatusChange", () => {
  it("sets startedAt when transitioning to reading and startedAt is null", () => {
    const before = Date.now();
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "reading",
      startedAt: null,
      finishedAt: null,
      currentPage: 0,
      totalPages: null,
    });
    const after = Date.now();

    expect(result.startedAt).not.toBeNull();
    const ts = new Date(result.startedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(0);
  });

  it("does NOT change startedAt when transitioning to reading and startedAt is already set", () => {
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "reading",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 0,
      totalPages: null,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
  });

  it("sets finishedAt when transitioning to read and finishedAt is null", () => {
    const before = Date.now();
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 50,
      totalPages: 200,
    });
    const after = Date.now();

    const ts = new Date(result.finishedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.startedAt).toBe(FIXED_TS);
  });

  it("does NOT change finishedAt when transitioning to read and finishedAt is already set", () => {
    const finishedTs = "2026-02-01T10:00:00.000Z";
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: finishedTs,
      currentPage: 200,
      totalPages: 200,
    });
    expect(result.finishedAt).toBe(finishedTs);
  });

  it("does NOT clear timestamps on reverse transition (read -> to_read)", () => {
    const result = computeStatusChange({
      prevStatus: "read",
      nextStatus: "to_read",
      startedAt: FIXED_TS,
      finishedAt: "2026-03-01T00:00:00.000Z",
      currentPage: 200,
      totalPages: 200,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBe("2026-03-01T00:00:00.000Z");
  });

  it("does NOT clear timestamps on reverse transition (reading -> to_read)", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "to_read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 50,
      totalPages: 200,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
  });

  it("to_read -> to_read keeps both null", () => {
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "to_read",
      startedAt: null,
      finishedAt: null,
      currentPage: 0,
      totalPages: null,
    });
    expect(result.startedAt).toBeNull();
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(0);
  });

  it("reading -> read with partial progress: bumps currentPage to totalPages", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 30,
      totalPages: 200,
    });
    expect(result.currentPage).toBe(200);
  });

  it("to_read -> read with partial progress: bumps currentPage to totalPages", () => {
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "read",
      startedAt: null,
      finishedAt: null,
      currentPage: 0,
      totalPages: 350,
    });
    expect(result.currentPage).toBe(350);
  });

  it("reading -> read with currentPage already at totalPages: leaves currentPage untouched", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 200,
      totalPages: 200,
    });
    expect(result.currentPage).toBe(200);
  });

  it("reading -> read with totalPages=null: cannot auto-complete, leaves currentPage untouched", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 30,
      totalPages: null,
    });
    expect(result.currentPage).toBe(30);
  });

  it("reading -> reading with partial progress: leaves currentPage untouched", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "reading",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 30,
      totalPages: 200,
    });
    expect(result.currentPage).toBe(30);
  });

  // FR-TR-1: to_read → paused
  it("to_read -> paused: startedAt null, finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "paused",
      startedAt: null,
      finishedAt: null,
      currentPage: 0,
      totalPages: null,
    });
    expect(result.startedAt).toBeNull();
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(0);
  });

  // FR-TR-2: to_read → abandoned
  it("to_read -> abandoned: startedAt null, finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "to_read",
      nextStatus: "abandoned",
      startedAt: null,
      finishedAt: null,
      currentPage: 0,
      totalPages: null,
    });
    expect(result.startedAt).toBeNull();
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(0);
  });

  // FR-TR-3: reading → paused
  it("reading -> paused: startedAt preserved, finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "paused",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 120,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(120);
  });

  // FR-TR-4: reading → abandoned
  it("reading -> abandoned: startedAt preserved, finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "reading",
      nextStatus: "abandoned",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 120,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(120);
  });

  // FR-TR-9: read → paused — clears finishedAt
  it("read -> paused: startedAt preserved, finishedAt CLEARED, currentPage preserved", () => {
    const FINISHED_TS = "2026-04-30T00:00:00.000Z";
    const result = computeStatusChange({
      prevStatus: "read",
      nextStatus: "paused",
      startedAt: FIXED_TS,
      finishedAt: FINISHED_TS,
      currentPage: 300,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(300);
  });

  // FR-TR-10: read → abandoned — clears finishedAt
  it("read -> abandoned: startedAt preserved, finishedAt CLEARED, currentPage preserved", () => {
    const FINISHED_TS = "2026-04-30T00:00:00.000Z";
    const result = computeStatusChange({
      prevStatus: "read",
      nextStatus: "abandoned",
      startedAt: FIXED_TS,
      finishedAt: FINISHED_TS,
      currentPage: 300,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(300);
  });

  // FR-TR-5: paused → reading
  it("paused -> reading: startedAt preserved (no re-set), finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "paused",
      nextStatus: "reading",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 120,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(120);
  });

  // FR-TR-6: abandoned → reading
  it("abandoned -> reading: startedAt preserved, finishedAt null, currentPage preserved", () => {
    const result = computeStatusChange({
      prevStatus: "abandoned",
      nextStatus: "reading",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 50,
      totalPages: 300,
    });
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.currentPage).toBe(50);
  });

  // FR-TR-7: paused → read
  it("paused -> read: startedAt preserved, finishedAt set if null, currentPage bumped to totalPages", () => {
    const before = Date.now();
    const result = computeStatusChange({
      prevStatus: "paused",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 200,
      totalPages: 300,
    });
    const after = Date.now();
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).not.toBeNull();
    const ts = new Date(result.finishedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.currentPage).toBe(300);
  });

  // FR-TR-8: abandoned → read
  it("abandoned -> read: startedAt preserved, finishedAt set if null, currentPage bumped to totalPages", () => {
    const before = Date.now();
    const result = computeStatusChange({
      prevStatus: "abandoned",
      nextStatus: "read",
      startedAt: FIXED_TS,
      finishedAt: null,
      currentPage: 50,
      totalPages: 300,
    });
    const after = Date.now();
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).not.toBeNull();
    const ts = new Date(result.finishedAt!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.currentPage).toBe(300);
  });
});

describe("computeProgressTransition", () => {
  it("to_read + currentPage=0 → no auto-transition, no prompt", () => {
    const result = computeProgressTransition({
      prevStatus: "to_read",
      currentPage: 0,
      totalPages: 200,
      currentStartedAt: null,
      currentFinishedAt: null,
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
      currentFinishedAt: null,
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
      currentFinishedAt: null,
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
      currentFinishedAt: null,
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
      currentFinishedAt: null,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(true);
  });

  it("read + currentPage=0 + totalPages set → reverse to reading, clears finishedAt, preserves startedAt", () => {
    const FINISHED_TS = "2026-04-01T10:00:00.000Z";
    const result = computeProgressTransition({
      prevStatus: "read",
      currentPage: 0,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: FINISHED_TS,
    });
    expect(result.autoStatus).toBe("reading");
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.promptComplete).toBe(false);
  });

  it("read + currentPage=100 (below total) → reverse to reading, clears finishedAt", () => {
    const FINISHED_TS = "2026-04-01T10:00:00.000Z";
    const result = computeProgressTransition({
      prevStatus: "read",
      currentPage: 100,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: FINISHED_TS,
    });
    expect(result.autoStatus).toBe("reading");
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.finishedAt).toBeNull();
    expect(result.promptComplete).toBe(false);
  });

  it("read + currentPage=totalPages → no transition (still complete), promptComplete=true", () => {
    const FINISHED_TS = "2026-04-01T10:00:00.000Z";
    const result = computeProgressTransition({
      prevStatus: "read",
      currentPage: 200,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: FINISHED_TS,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.finishedAt).toBe(FINISHED_TS);
    expect(result.promptComplete).toBe(true);
  });

  it("read + currentPage=100 + totalPages=null → no transition (can't determine progress)", () => {
    const FINISHED_TS = "2026-04-01T10:00:00.000Z";
    const result = computeProgressTransition({
      prevStatus: "read",
      currentPage: 100,
      totalPages: null,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: FINISHED_TS,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.finishedAt).toBe(FINISHED_TS);
    expect(result.promptComplete).toBe(false);
  });

  it("reading + totalPages=null + currentPage=999 → promptComplete=false (null totalPages never triggers prompt)", () => {
    const result = computeProgressTransition({
      prevStatus: "reading",
      currentPage: 999,
      totalPages: null,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: null,
    });
    expect(result.promptComplete).toBe(false);
    expect(result.autoStatus).toBeNull();
  });

  // FR-AT-1: paused + forward progress → auto-transition to reading, startedAt preserved
  it("paused + currentPage=5 + startedAt=FIXED_TS → autoStatus=reading, startedAt preserved", () => {
    const result = computeProgressTransition({
      prevStatus: "paused",
      currentPage: 5,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: null,
    });
    expect(result.autoStatus).toBe("reading");
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.promptComplete).toBe(false);
  });

  // FR-AT-2: abandoned + forward progress → auto-transition to reading, startedAt preserved
  it("abandoned + currentPage=5 + startedAt=FIXED_TS → autoStatus=reading, startedAt preserved", () => {
    const result = computeProgressTransition({
      prevStatus: "abandoned",
      currentPage: 5,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: null,
    });
    expect(result.autoStatus).toBe("reading");
    expect(result.startedAt).toBe(FIXED_TS);
    expect(result.promptComplete).toBe(false);
  });

  // Negative: paused + currentPage=0 → no auto-transition
  it("paused + currentPage=0 → no auto-transition, autoStatus null, no promptComplete", () => {
    const result = computeProgressTransition({
      prevStatus: "paused",
      currentPage: 0,
      totalPages: 200,
      currentStartedAt: FIXED_TS,
      currentFinishedAt: null,
    });
    expect(result.autoStatus).toBeNull();
    expect(result.promptComplete).toBe(false);
  });
});

describe("shouldBumpProgressTimestamp", () => {
  it("reading + page changed → bump TRUE", () => {
    expect(
      shouldBumpProgressTimestamp({
        prevStatus: "reading",
        autoStatus: null,
        currentPage: 50,
        previousPage: 30,
      })
    ).toBe(true);
  });

  it("to_read + autoStatus 'reading' (first progress) + page changed → bump TRUE", () => {
    expect(
      shouldBumpProgressTimestamp({
        prevStatus: "to_read",
        autoStatus: "reading",
        currentPage: 5,
        previousPage: 0,
      })
    ).toBe(true);
  });

  it("reading -> read (finishing) + page changed → bump TRUE", () => {
    expect(
      shouldBumpProgressTimestamp({
        prevStatus: "reading",
        autoStatus: "read",
        currentPage: 200,
        previousPage: 199,
      })
    ).toBe(true);
  });

  it("page unchanged → bump FALSE", () => {
    expect(
      shouldBumpProgressTimestamp({
        prevStatus: "reading",
        autoStatus: null,
        currentPage: 50,
        previousPage: 50,
      })
    ).toBe(false);
  });

  it("to_read with no transition into reading → bump FALSE", () => {
    expect(
      shouldBumpProgressTimestamp({
        prevStatus: "to_read",
        autoStatus: null,
        currentPage: 0,
        previousPage: 0,
      })
    ).toBe(false);
  });
});
