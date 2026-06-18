import { useCallback, useEffect, useState } from "react";
import { createGenLayerClient, CONTRACT_ADDRESS } from "../lib/genlayerClient";
import { AuditResult, EMPTY_AUDIT_RESULT } from "../types/contract";

interface UseAuditStateResult {
  data: AuditResult;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Reads UpgradeSafetyChecker.get_audit_result() — a `@gl.public.view` method,
 * so this is a free read against the latest ledger state.
 */
export function useAuditState(): UseAuditStateResult {
  const [data, setData] = useState<AuditResult>(EMPTY_AUDIT_RESULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!CONTRACT_ADDRESS) {
      setError("VITE_CONTRACT_ADDRESS is not set — see frontend/.env.example");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = createGenLayerClient();
      const result = (await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "get_audit_result",
        args: [],
      })) as unknown as AuditResult;

      setData(result);
    } catch (err) {
      console.error("Failed to read ledger state:", err);
      setError(
        err instanceof Error ? err.message : "Failed to read ledger state"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
