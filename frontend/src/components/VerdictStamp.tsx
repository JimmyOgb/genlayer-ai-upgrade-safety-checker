import { riskTone } from "../lib/format";
import type { RiskLevel } from "../types/contract";

interface VerdictStampProps {
  hasAudited: boolean;
  isApproved: boolean;
  riskLevel: RiskLevel;
}

const TONE_STYLES = {
  safe: "border-verdict-safe text-verdict-safe",
  pending: "border-verdict-pending text-verdict-pending",
  risk: "border-verdict-risk text-verdict-risk",
  neutral: "border-ink-faint text-ink-faint",
} as const;

export default function VerdictStamp({
  hasAudited,
  isApproved,
  riskLevel,
}: VerdictStampProps) {
  if (!hasAudited) {
    return (
      <div className="inline-flex -rotate-6 items-center rounded border-[3px] border-dashed border-ink-faint px-4 py-1.5">
        <span className="font-display text-lg font-bold uppercase tracking-wide text-ink-faint">
          Pending
        </span>
      </div>
    );
  }

  const tone = isApproved ? "safe" : riskTone(riskLevel) === "safe" ? "pending" : riskTone(riskLevel);
  const label = isApproved ? "Approved" : "Rejected";

  return (
    <div
      className={`animate-stamp inline-flex -rotate-6 items-center rounded border-[3px] px-4 py-1.5 ${TONE_STYLES[tone]}`}
    >
      <span className="font-display text-lg font-bold uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
