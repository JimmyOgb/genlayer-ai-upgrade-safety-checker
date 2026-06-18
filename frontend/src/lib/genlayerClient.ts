import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

/**
 * The deployed UpgradeSafetyChecker contract address.
 * Set VITE_CONTRACT_ADDRESS in `.env` (see `.env.example`).
 */
export const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ??
  "") as string;

/**
 * Hosted Studio RPC endpoint. Override for a local `genlayer up` instance.
 */
export const STUDIO_RPC_URL = (import.meta.env.VITE_GENLAYER_RPC_URL ??
  "https://studio.genlayer.com/api") as string;

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/** True if a browser wallet (e.g. MetaMask) is available to sign transactions. */
export function hasWallet(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Creates a genlayer-js client.
 * Pass an account address once a wallet is connected so writeContract calls
 * (run_audit) are signed by that account; omit it for read-only access.
 */
export function createGenLayerClient(account?: `0x${string}`) {
  return createClient({
    chain: studionet,
    endpoint: STUDIO_RPC_URL,
    ...(account ? { account } : {}),
  });
}

/** Requests account access from an injected wallet, if present. */
export async function requestWalletAccount(): Promise<`0x${string}` | null> {
  if (!hasWallet()) return null;
  const accounts = (await window.ethereum!.request({
    method: "eth_requestAccounts",
  })) as string[];
  return (accounts[0] as `0x${string}`) ?? null;
}
