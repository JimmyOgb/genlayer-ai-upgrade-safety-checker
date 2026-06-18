import { FormEvent, useState } from "react";
import { Loader2, ScanLine } from "lucide-react";
import { useRunAudit } from "../hooks/useRunAudit";
import { looksLikeCid } from "../lib/format";

interface AuditFormProps {
  onSettled: () => void;
  alreadyAudited: boolean;
}

const STATUS_COPY: Record<string, string> = {
  connecting: "Requesting wallet account…",
  submitting: "Submitting transaction to GenLayer…",
  "awaiting-consensus": "Validators are auditing — waiting for consensus…",
  done: "Consensus reached. Ledger updated below.",
};

export default function AuditForm({ onSettled, alreadyAudited }: AuditFormProps) {
  const [oldCid, setOldCid] = useState("");
  const [newCid, setNewCid] = useState("");
  const { status, error, runAudit, reset } = useRunAudit();

  const busy = status === "connecting" || status === "submitting" || status === "awaiting-consensus";
  const oldValid = looksLikeCid(oldCid);
  const newValid = looksLikeCid(newCid);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!oldValid || !newValid || busy) return;
    await runAudit(oldCid.trim(), newCid.trim());
    onSettled();
  }

  if (alreadyAudited) {
    return (
      <section className="hairline ticket-edge rounded-md bg-panel px-6 py-5">
        <p className="eyebrow mb-2">Trigger new AI audit</p>
        <p className="font-mono text-sm text-ink-muted">
          This deployment has already returned a verdict. Each contract
          instance issues exactly one audit — deploy a fresh instance to
          review another upgrade.
        </p>
      </section>
    );
  }

  return (
    <section className="hairline ticket-edge rounded-md bg-panel px-6 py-5">
      <p className="eyebrow mb-4">Trigger new AI audit</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Exhibit A — old code CID"
            value={oldCid}
            onChange={setOldCid}
            invalid={oldCid.length > 0 && !oldValid}
            disabled={busy}
          />
          <Field
            label="Exhibit B — new code CID"
            value={newCid}
            onChange={setNewCid}
            invalid={newCid.length > 0 && !newValid}
            disabled={busy}
          />
        </div>

        <button
          type="submit"
          disabled={!oldValid || !newValid || busy}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-verdict-safe/40 bg-verdict-safe/10 px-4 py-2.5 font-mono text-xs uppercase tracking-widest2 text-verdict-safe transition-colors hover:bg-verdict-safe/15 disabled:cursor-not-allowed disabled:border-hairline disabled:bg-transparent disabled:text-ink-faint"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ScanLine className="h-3.5 w-3.5" />
          )}
          Run decentralized audit
        </button>

        {(status !== "idle" || error) && (
          <p
            className={`font-mono text-xs ${
              error ? "text-verdict-risk" : "text-ink-muted"
            }`}
            role="status"
          >
            {error ?? STATUS_COPY[status]}
            {error && (
              <button
                type="button"
                onClick={reset}
                className="ml-2 underline decoration-dotted hover:text-ink-primary"
              >
                dismiss
              </button>
            )}
          </p>
        )}
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  invalid,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest2 text-ink-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
        spellCheck={false}
        className={`w-full rounded-sm border bg-void px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-faint focus:outline-none ${
          invalid ? "border-verdict-risk/60" : "border-hairline"
        } disabled:opacity-50`}
      />
    </label>
  );
}
