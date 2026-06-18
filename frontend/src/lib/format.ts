import type { RiskLevel } from "../types/contract";

/** Loose check for a plausible IPFS CID (v0 or v1), not a full multibase validator. */
export function looksLikeCid(value: string): boolean {
  const v = value.trim();
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(v) || /^ba[a-z0-9]{20,}$/i.test(v);
}

export function shortAddress(address: string, head = 6, tail = 4): string {
  if (!address || address.length <= head + tail + 3) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export const RISK_ORDER: RiskLevel[] = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function riskTone(risk: RiskLevel): "safe" | "pending" | "risk" | "neutral" {
  switch (risk) {
    case "NONE":
    case "LOW":
      return "safe";
    case "MEDIUM":
      return "pending";
    case "HIGH":
    case "CRITICAL":
      return "risk";
    default:
      return "neutral";
  }
}
