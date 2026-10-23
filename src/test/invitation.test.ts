import { describe, expect, it } from "vitest";
import { INVITATION } from "@/lib/invitation";

describe("Birthday date", () => {
  it("falls on Sunday, 25 October in the current invitation year", () => {
    const date = new Date(`${INVITATION.date}T12:00:00+05:30`);
    expect(date.getUTCDate()).toBe(25);
    expect(date.getUTCMonth()).toBe(9);
    expect(date.getUTCDay()).toBe(0);
  });
});