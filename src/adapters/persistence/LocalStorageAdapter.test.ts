import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { LocalStorageAdapter } from "./LocalStorageAdapter";

describe("LocalStorageAdapter", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("round-trips a step under the default prefix", () => {
    const a = new LocalStorageAdapter();
    a.saveStep("basics", { name: "x" });
    expect(localStorage.getItem("wizard_basics")).toBe('{"name":"x"}');
    expect(a.getStep("basics")).toEqual({ name: "x" });
  });

  it("returns undefined for a missing step", () => {
    expect(new LocalStorageAdapter().getStep("nope")).toBeUndefined();
  });

  it("isolates instances by prefix and clears only its own keys", () => {
    const mine = new LocalStorageAdapter("mine_");
    const other = new LocalStorageAdapter("other_");
    mine.saveStep("s", 1);
    other.saveStep("s", 2);

    mine.clear();
    expect(mine.getStep("s")).toBeUndefined();
    expect(other.getStep("s")).toBe(2);
  });

  it("warns instead of throwing when storage rejects a write", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => new LocalStorageAdapter().saveStep("s", { a: 1 })).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });

  it("warns and returns undefined on corrupted JSON", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem("wizard_bad", "{not json");

    expect(new LocalStorageAdapter().getStep("bad")).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
