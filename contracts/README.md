# `UpgradeSafetyChecker` — Intelligent Contract

A GenLayer Intelligent Contract that runs a single, non-repudiable, AI-adjudicated
security audit comparing a "before" and "after" version of a smart contract's
source code, ahead of an upgrade going live.

Reference deployment (GenLayer Studio / studionet):
[`0x222201F7742dac79Aa37cd6aC5242F65eb303745`](https://studio.genlayer.com/?import-contract=0x222201F7742dac79Aa37cd6aC5242F65eb303745)

## Why this exists

Upgradeable contracts are a common source of exploits: a proxy points at new
implementation code, and nobody outside the core team can cheaply verify that
the new code preserves storage layout, access control, and intended business
logic before the upgrade is executed. `UpgradeSafetyChecker` gives any
upgrade a public, on-chain, AI-reviewed paper trail: point it at the old and
new source (via IPFS), and a quorum of GenLayer validators — each running an
LLM — independently judges the diff and reaches consensus on a verdict.

## How it works

```
            ┌─────────────────────┐
old_code_cid│                     │
───────────▶│   run_audit(...)    │
new_code_cid│                     │
            └──────────┬──────────┘
                        │ fetch both sources over IPFS (dweb.link gateway)
                        ▼
            ┌─────────────────────────────┐
            │ gl.nondet.exec_prompt(task)  │  "ultra-conservative Web3
            │  run independently by each   │   Security Oracle" persona
            │  validator                   │
            └──────────────┬───────────────┘
                            │ gl.eq_principle.strict_eq
                            │ (validators must agree byte-for-byte
                            │  on the JSON the leader proposed)
                            ▼
            ┌─────────────────────────────┐
            │ state updated, is_approved   │
            │ computed deterministically   │
            └─────────────────────────────┘
```

1. **`run_audit(old_code_cid, new_code_cid)`** *(write, one-shot)*
   - Resolves both CIDs through the `dweb.link` public IPFS gateway.
   - Builds a single prompt instructing the model to behave as an
     "ultra-conservative Web3 Security Oracle" and to check specifically for:
     1. **Storage layout collisions** — reordered or retyped state variables.
     2. **Authorization bypasses** — missing or weakened access control.
     3. **Business logic vulnerabilities** — new reentrancy, overflow, or
        logic bugs introduced by the diff.
   - The model is constrained to return *only* strict JSON
     (`security_decreased`, `risk_level`, `storage_collision_detected`,
     `findings`), which is parsed with `json.loads` so a malformed response
     fails loudly instead of being silently misinterpreted.
   - Wrapped in `gl.eq_principle.strict_eq`, GenLayer's comparative
     equivalence principle: every validator runs the same non-deterministic
     block independently, and consensus is only reached if they produce an
     **identical** JSON result. This is intentionally strict — for a
     security verdict, "close enough" is not an acceptable agreement
     mechanism between validators.
   - Persists the verdict to contract storage and derives `is_approved`
     **deterministically** from the model's own structured output, so the
     pass/fail rule is auditable independently of the LLM call itself:
     ```python
     is_approved = not security_decreased and risk_level not in ("HIGH", "CRITICAL")
     ```
   - Guarded by `has_audited`: a deployed instance can only ever be audited
     **once**. This is deliberate — an audit you can re-roll until you like
     the answer is not an audit. Each upgrade decision gets its own contract
     deployment, producing an immutable, independently verifiable record.

2. **`get_audit_result()`** *(view)*
   Returns the full verdict as a single JSON-friendly dict — the shape the
   frontend renders directly:
   ```jsonc
   {
     "has_audited": true,
     "is_approved": false,
     "security_decreased": true,
     "risk_level": "HIGH",
     "storage_collision": false,
     "findings": ["Access modifier removed from withdraw()", "..."],
     "old_code_cid": "bafy...",
     "new_code_cid": "bafy..."
   }
   ```

## State

| Field                 | Type   | Meaning                                                        |
|------------------------|--------|------------------------------------------------------------------|
| `has_audited`          | bool   | Whether `run_audit` has already been executed (one-shot gate)    |
| `is_approved`          | bool   | Deterministic verdict derived from the model's structured output |
| `risk_level`           | str    | One of `NONE`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`                |
| `findings`             | str    | JSON-encoded `list[str]` of specific issues found                |
| `security_decreased`   | bool   | Whether the new version is judged less safe than the old one     |
| `storage_collision`    | bool   | Whether a storage layout collision was detected                  |
| `old_code_cid`         | str    | IPFS CID of the pre-upgrade source                                |
| `new_code_cid`         | str    | IPFS CID of the post-upgrade source                               |

## Deploying your own instance

Requires the [GenLayer CLI](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-cli)
or the [genlayer-js](https://github.com/genlayerlabs/genlayer-js) SDK, and a
running target network (GenLayer Studio / `studionet`, `localnet`, or a
testnet).

```bash
# from the repo root
npm install -g genlayer
genlayer deploy --contract contracts/upgrade_safety_checker.py
```

or via the TypeScript deploy script in [`/deploy`](../deploy), which also
prints the address to drop into the frontend's `.env`. See the root
[README](../README.md) for the full setup flow.

## Known limitations (by design, and worth being explicit about)

- **The auditor is an LLM, not a formal verifier.** `exec_prompt` is a
  language model forming a judgment call, not a symbolic prover. Treat a
  passing verdict as one strong, independently-reproducible signal among
  several you'd want before shipping an upgrade — not a substitute for a
  professional audit.
- **Gateway trust.** Source is fetched through a single public gateway
  (`dweb.link`). If that gateway is unreachable or returns different bytes
  to different validators for the same CID, validators can disagree and the
  transaction will fail to reach consensus rather than silently produce a
  wrong answer — which is the safer failure mode, but worth knowing about.
- **One verdict per deployment.** There is no `reset` or `re-audit` method.
  This is intentional (see above), but it means a typo'd CID requires a
  fresh deployment, not a retry.

See [`SECURITY.md`](../SECURITY.md) for how to report issues with this
repository itself.
