import { useCallback, useState } from "react";
import {
  createGenLayerClient,
  CONTRACT_ADDRESS,
  requestWalletAccount,
} from "../lib/genlayerClient";

export type AuditTxStatus =
  | "idle"
  | "connecting"
  | "submitting"
  | "awaiting-consensus"
  | "done"
  | "error";

interface UseRunAuditResult {
  status: AuditTxStatus;
  error: string | null;
  txHash: string | null;
  runAudit: (oldCid: string, newCid: string) => Promise<void>;
  reset: () => void;
}

/**
 * Submits UpgradeSafetyChecker.run_audit(old_code_cid, new_code_cid).
 * This is a `@gl.public.write` call: validators independently fetch both
 * sources, run the audit prompt, and must reach byte-identical consensus
 * (gl.eq_principle.strict_eq) before the transaction is ACCEPTED.
 * Expect this to take noticeably longer than a typical chain write —
 * it includes real LLM inference across the validator set.
 */
export function useRunAudit(): UseRunAuditResult {
  const [status, setStatus] = useState<AuditTxStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const runAudit = useCallback(async (oldCid: string, newCid: string) => {
    setError(null);
    setTxHash(null);

    if (!CONTRACT_ADDRESS) {
      setStatus("error");
      setError("VITE_CONTRACT_ADDRESS is not set — see frontend/.env.example");
      return;
    }

    try {
      setStatus("connecting");
      const account = await requestWalletAccount();
      const client = createGenLayerClient(account ?? undefined);

      setStatus("submitting");
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "run_audit",
        args: [oldCid, newCid],
        value: BigInt(0),
      });
      setTxHash(hash as unknown as string);

      setStatus("awaiting-consensus");
      await client.waitForTransactionReceipt({
        hash,
        status: "ACCEPTED" as any,
        retries: 60,
        interval: 5000,
      });

      setStatus("done");
    } catch (err) {
      console.error("run_audit failed:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "run_audit failed");
    }
  }, []);

  return { status, error, txHash, runAudit, reset };
}
