# Architecture

End-to-end flow from a person typing two IPFS CIDs into the dashboard to a
stamped verdict landing back on screen.

```mermaid
sequenceDiagram
    participant U as Person
    participant FE as Dashboard (Vite/React)
    participant SDK as genlayer-js
    participant Studio as GenLayer Studio (studionet)
    participant V as Validators (N, one leader)
    participant IPFS as dweb.link gateway

    U->>FE: Enter old/new CID, click "Run decentralized audit"
    FE->>SDK: writeContract(run_audit, [oldCid, newCid])
    SDK->>Studio: submit transaction
    Studio->>V: assign leader + validator set
    par each validator, independently
        V->>IPFS: GET /ipfs/{old_code_cid}
        V->>IPFS: GET /ipfs/{new_code_cid}
        V->>V: build oracle prompt, run exec_prompt (LLM)
        V->>V: json.loads(result) -- strict_eq comparison
    end
    V->>Studio: propose + vote on identical JSON result
    Studio->>SDK: transaction ACCEPTED (consensus reached)
    SDK->>FE: receipt
    FE->>SDK: readContract(get_audit_result)
    SDK->>Studio: query latest state
    Studio->>FE: {has_audited, is_approved, risk_level, findings, ...}
    FE->>U: render verdict stamp + risk badge + findings + raw JSON
```

## Why consensus is strict here

GenLayer's `gl.eq_principle.strict_eq` requires every validator's
independently-computed result to match **exactly** before a transaction is
accepted. For most non-deterministic tasks (e.g. summarizing a webpage)
teams use a looser equivalence principle, because near-misses are fine. For
a security verdict, a near-miss is the failure mode you're trying to avoid —
so this contract intentionally uses the strict variant. In practice this
means: if validators' LLM calls return materially different JSON (different
`risk_level`, different `findings`), the transaction does not reach
consensus rather than silently picking one validator's answer.

## Why one audit per deployment

`has_audited` is checked once and never reset. Two reasons:

1. **Non-repudiation.** A verdict you can keep re-running until it says what
   you want isn't a verdict — it's a slot machine. One contract instance =
   one immutable record, addressable forever at its deployment address.
2. **It maps cleanly onto how upgrades actually happen.** A real upgrade
   decision is a single event (ship it or don't), so the audit record should
   be too. Auditing a second upgrade later is a second deployment, not a
   second call.

## Trust boundaries, explicitly

| Boundary | What's trusted | What isn't |
|---|---|---|
| IPFS fetch | The `dweb.link` gateway returns the same bytes for a given CID to every validator | The gateway itself isn't a validator — if it serves stale/different content, validators may disagree and consensus simply fails closed |
| LLM judgment | The model can reason usefully about a code diff when given clear instructions and forced into structured output | The model is not a formal verifier; treat "Approved" as a strong signal, not a proof |
| Contract logic | `is_approved` is derived by ordinary, auditable Python from the model's own structured fields — not by the model itself | None of the contract's deterministic logic depends on trusting the model's *prose*, only its three structured fields |

See [`contracts/README.md`](../contracts/README.md) for the contract's
method-level documentation, and [`SECURITY.md`](../SECURITY.md) for how
these limitations relate to actually shipping an upgrade.
