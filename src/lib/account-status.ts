export type MonetizationStatus = "monetized" | "pending" | "rejected";

export function getMonetizationStatus(account: { followers: number; monetization_rejected?: boolean }): MonetizationStatus {
  if (account.monetization_rejected) return "rejected";
  return account.followers >= 10_000 ? "monetized" : "pending";
}

export function matchesAccountStatus(account: { followers: number; monetization_rejected?: boolean }, filter: string) {
  if (filter === "all") return true;
  if (filter === "shop") return account.followers >= 2_000;
  return getMonetizationStatus(account) === filter;
}