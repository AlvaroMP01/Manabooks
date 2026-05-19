export type ActionResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: "unauthorized" | "invalid_input" | "already_added" | "not_found" | "unknown";
      message?: string;
    };
