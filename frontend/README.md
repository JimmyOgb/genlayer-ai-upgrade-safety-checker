# Frontend — AI Upgrade Safety Dashboard

Vite + React + TypeScript + Tailwind dashboard for `UpgradeSafetyChecker`,
talking to GenLayer via [`genlayer-js`](https://github.com/genlayerlabs/genlayer-js).

## Setup

```bash
npm install            # from the repo root, or `npm install` here directly
cp .env.example .env
npm run dev
```

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `VITE_GENLAYER_RPC_URL` | `https://studio.genlayer.com/api` | GenLayer Studio backend. Point at `http://127.0.0.1:4000/api` for a local `genlayer up` instance. |
| `VITE_CONTRACT_ADDRESS` | reference deployment | Address of the deployed `UpgradeSafetyChecker` instance to read/write. |

## Structure

```
src/
  lib/genlayerClient.ts   genlayer-js client factory + wallet connect helper
  lib/format.ts           CID validation, address shortening, risk → tone mapping
  hooks/useAuditState.ts  reads get_audit_result() (view call)
  hooks/useRunAudit.ts    writes run_audit() and waits for the receipt
  components/             CaseHeader, AuditForm, VerdictStamp, RiskBadge,
                           FindingsList, RawPayload, LedgerPanel
  types/contract.ts       AuditResult — keep in sync with the contract's
                           get_audit_result() return shape
```

## Design notes

The visual language is deliberately a "case file" rather than a generic
dashboard: a stamped verdict badge as the one bold element, monospace for
anything machine-verifiable (CIDs, JSON, risk codes), and a quieter sans for
human-facing copy. See `tailwind.config.ts` for the token system
(`void` / `panel` / `hairline` / `verdict.*`) if you're adding a component
and want it to match.

`npm run build` runs `tsc -b` before `vite build`, so type errors fail the
build rather than silently shipping.
