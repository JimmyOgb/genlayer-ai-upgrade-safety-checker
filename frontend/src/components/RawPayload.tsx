import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { AuditResult } from "../types/contract";

export default function RawPayload({ data }: { data: AuditResult }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(data, null, 2);

  async function copy() {
    try {
      await navigator.clipboard.writeText(json);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access denied — silently ignore, the JSON is still visible.
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="eyebrow">Raw on-chain JSON payload</p>
        <button
          onClick={copy}
          className="flex items-center gap-1 font-mono text-[11px] text-ink-muted transition-colors hover:text-ink-primary"
        >
          {copied ? (
            <Check className="h-3 w-3 text-verdict-safe" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="hairline overflow-x-auto rounded-sm bg-void p-3 font-mono text-xs leading-relaxed text-ink-muted">
        {json}
      </pre>
    </div>
  );
}
