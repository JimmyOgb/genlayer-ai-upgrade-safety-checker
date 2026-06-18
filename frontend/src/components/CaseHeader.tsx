import { Stamp } from "lucide-react";
import { CONTRACT_ADDRESS } from "../lib/genlayerClient";
import { shortAddress } from "../lib/format";

export default function CaseHeader() {
  const studioUrl = CONTRACT_ADDRESS
    ? `https://studio.genlayer.com/?import-contract=${CONTRACT_ADDRESS}`
    : "https://studio.genlayer.com/";

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Stamp className="h-4 w-4 text-verdict-safe" strokeWidth={1.75} />
          <span className="eyebrow">GenLayer · Case File</span>
        </div>
        <a
          href={studioUrl}
          target="_blank"
          rel="noreferrer"
          className="eyebrow transition-colors hover:text-ink-primary"
        >
          contract&nbsp;
          {CONTRACT_ADDRESS ? shortAddress(CONTRACT_ADDRESS) : "not configured"}
        </a>
      </div>
    </header>
  );
}
