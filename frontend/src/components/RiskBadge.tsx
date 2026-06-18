import { riskTone } from "../lib/format";
import type { RiskLevel } from "../types/contract";

const DOT_TONE = {
  safe: "bg-verdict-safe",
  pending: "bg-verdict-pending",
  risk: "bg-verdict-risk",
  neutral: "bg-ink-faint",
} as const;

export default function RiskBadge({ riskLevel }: { riskLevel: RiskLevel }) {
  const tone = riskTone(riskLevel);
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONE[tone]}`} />
      {riskLevel || "—"}
    </span>
  );
}
