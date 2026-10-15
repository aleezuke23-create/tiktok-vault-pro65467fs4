import { test, expect } from "bun:test";
import { getMonetizationStatus, matchesAccountStatus } from "./account-status";

test("10k followers are monetized unless manually rejected", () => {
  expect(getMonetizationStatus({ followers: 10_000 })).toBe("monetized");
  expect(getMonetizationStatus({ followers: 9_999 })).toBe("pending");
});
test("manual rejection overrides follower eligibility and survives count changes", () => {
  for (const followers of [10_000, 12_000, 9_000]) {
    expect(getMonetizationStatus({ followers, monetization_rejected: true })).toBe("rejected");
  }
  expect(getMonetizationStatus({ followers: 12_000, monetization_rejected: false })).toBe("monetized");
});
test("rejected filter includes rejected accounts, not monetized or pending results", () => {
  const account = { followers: 10_000, monetization_rejected: true };
  expect(matchesAccountStatus(account, "rejected")).toBe(true);
  expect(matchesAccountStatus(account, "monetized")).toBe(false);
  expect(matchesAccountStatus(account, "pending")).toBe(false);
  expect(matchesAccountStatus({ followers: 10_000 }, "rejected")).toBe(false);
});
test("Shop still activates at 2k independently of rejection", () => {
  expect(matchesAccountStatus({ followers: 2_000, monetization_rejected: true }, "shop")).toBe(true);
  expect(matchesAccountStatus({ followers: 1_999 }, "shop")).toBe(false);
});