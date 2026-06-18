import type { ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import type { AuditResult } from "../types/contract";
import VerdictStamp from "./VerdictStamp";
import RiskBadge from "./RiskBadge";
import FindingsList from "./FindingsList";
import RawPayload from "./RawPayload";
import { shortAddress } from "../lib/format";

interface LedgerPanelProps {
  data: AuditResult;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function LedgerPanel({
  data,
  loading,
  error,
  onRefresh,
}: LedgerPanelProps) {
  return (
    <section className="hairline rounded-md bg-panel px-6 py-5">
      <div className="mb-5 flex items-center justify-between">
        <p className="eyebrow">Ledger state</p>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest2 text-ink-muted transition-colors hover:text-ink-primary disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 font-mono text-xs text-verdict-risk">{error}</p>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <VerdictStamp
          hasAudited={data.has_audited}
          isApproved={data.is_approved}
          riskLevel={data.risk_level}
        />
        <dl className="grid grid-cols-3 gap-x-6 gap-y-1 text-right">
          <Stat label="Risk" value={<RiskBadge riskLevel={data.risk_level} />} />
          <Stat
            label="Security ↓"
            value={data.has_audited ? (data.security_decreased ? "yes" : "no") : "—"}
          />
          <Stat
            label="Storage collision"
            value={data.has_audited ? (data.storage_collision ? "yes" : "no") : "—"}
          />
        </dl>
      </div>

      <div className="mb-6 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
        <CidField label="Old CID" value={data.old_code_cid} />
        <CidField label="New CID" value={data.new_code_cid} />
      </div>

      <div className="mb-6 border-t border-hairline pt-4">
        <FindingsList findings={data.findings} />
      </div>

      <div className="border-t border-hairline pt-4">
        <RawPayload data={data} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest2 text-ink-faint">
        {label}
      </dt>
      <dd className="font-mono text-sm text-ink-primary">{value}</dd>
    </div>
  );
}

function CidField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[11px] uppercase tracking-widest2 text-ink-muted">
        {label}
      </p>
      <p className="font-mono text-sm text-ink-primary" title={value || undefined}>
        {value ? shortAddress(value, 10, 6) : "—"}
      </p>
    </div>
  );
}
