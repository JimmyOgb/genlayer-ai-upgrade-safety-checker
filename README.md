# AI Upgrade Safety Checker

A [GenLayer](https://www.genlayer.com/) Intelligent Contract — plus the
dashboard in front of it — that runs a single, public, AI-consensus security
audit comparing a contract's pre-upgrade and post-upgrade source before that
upgrade ships.

**Live dashboard:** https://aiaudict.lovable.app/
**Reference contract (GenLayer Studio):** https://studio.genlayer.com/?import-contract=0x222201F7742dac79Aa37cd6aC5242F65eb303745

## The idea

Upgradeable contracts fail in a specific, recurring way: a proxy starts
pointing at new implementation code, and the only people who can cheaply
verify that the new code preserves storage layout, access control, and
intended logic are the people who wrote it. Everyone else is trusting the
team.

`UpgradeSafetyChecker` gives an upgrade a public paper trail instead. Point
it at the old and new source over IPFS, and a quorum of independent GenLayer
validators — each running an LLM — reviews the diff for storage collisions,
weakened access control, and new logic bugs, and only commits a verdict to
chain if they reach byte-identical consensus on the result.

```
   old code CID ──┐
                   ├──▶ run_audit() ──▶ validators fetch + judge independently
   new code CID ──┘                          │
                                strict consensus (or it doesn't settle)
                                              │
                                              ▼
                          APPROVED / REJECTED + risk level + findings
```

One deployment, one verdict, no re-rolls — see
[`contracts/README.md`](contracts/README.md) for why that's deliberate, and
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full request lifecycle
and trust model.

## Repository layout

| Path | What it is |
|---|---|
| [`contracts/upgrade_safety_checker.py`](contracts/upgrade_safety_checker.py) | The Intelligent Contract (GenVM / Python) |
| [`contracts/README.md`](contracts/README.md) | Contract design, state, and method docs |
| [`tests/direct/`](tests/direct) | Fast offline unit tests — mocked IPFS + LLM |
| [`tests/integration/`](tests/integration) | Tests against a live network and real LLM |
| [`deploy/deployScript.ts`](deploy/deployScript.ts) | `genlayer-js` deploy script |
| [`frontend/`](frontend) | The dashboard — Vite + React + TypeScript + Tailwind |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | End-to-end sequence diagram + trust boundaries |

## Quickstart

### 1. Clone and install

```bash
git clone <your-fork-or-this-repo-url>
cd ai-upgrade-safety-checker
npm install                       # installs the frontend workspace
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt   # contract tooling: gltest, genvm-linter
```

### 2. Use the existing reference deployment (fastest path)

The dashboard already points at a live instance on GenLayer Studio
(`0x222201F7742dac79Aa37cd6aC5242F65eb303745`). To run the dashboard against
it locally:

```bash
cp frontend/.env.example frontend/.env   # already has the reference address
npm run dev
```

Open the printed local URL. Note that reference instance may already have
been audited once — `run_audit` is one-shot per deployment (see below) — in
which case you'll see its recorded verdict rather than be able to trigger a
new one. Deploy your own instance (next section) to run a fresh audit.

### 3. Deploy your own instance

Requires the [GenLayer CLI](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-cli):

```bash
npm install -g genlayer
genlayer network        # choose studionet, localnet, or a testnet
genlayer deploy          # runs deploy/deployScript.ts against contracts/upgrade_safety_checker.py
```

Copy the printed address into `frontend/.env` as `VITE_CONTRACT_ADDRESS`,
then `npm run dev`.

### 4. Trigger an audit

You'll need two IPFS CIDs pointing at the old and new contract source as
plain text (pin them with any IPFS pinning service, or `ipfs add` locally).
Paste both into the dashboard's "Exhibit A / Exhibit B" fields and submit —
this is a real write transaction, so expect it to take noticeably longer
than a typical chain call: validators are fetching both files and running
real LLM inference before they can agree on a result.

## Testing

```bash
# Style + the official GenVM AST-based safety linter — fast, no network
ruff check contracts/ tests/
genvm-lint lint contracts/upgrade_safety_checker.py

# Offline unit tests: IPFS fetch and the LLM call are both mocked
pytest tests/direct -v

# Against a live network, with real LLM calls (see tests/integration for setup)
gltest tests/integration -v -s
```

`pytest tests/direct` downloads a matching GenVM Python SDK build on first
run (cached afterward in `~/.cache/gltest-direct`), so it needs outbound
internet access once. The frontend has its own check:

```bash
cd frontend && npm run build   # tsc --noEmit, then a production build
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs all of the
above except the live-network integration tests, which require a running
network and aren't suitable for an unattended pipeline.

## How the verdict is computed

The contract never lets the model's prose decide the outcome directly. The
model is forced into a fixed JSON shape (`security_decreased`, `risk_level`,
`storage_collision_detected`, `findings`), and the approval rule is plain,
auditable Python applied to those fields:

```python
is_approved = not security_decreased and risk_level not in ("HIGH", "CRITICAL")
```

So a model that finds *any* security regression — even at "LOW" stated risk
— fails the upgrade, and the only way to pass is an explicit "no regression,
and risk isn't HIGH/CRITICAL" verdict from independent validator consensus.
The full prompt and field-by-field rationale are in
[`contracts/README.md`](contracts/README.md).

## Known limitations

This is documented in detail in
[`contracts/README.md`](contracts/README.md#known-limitations-by-design-and-worth-being-explicit-about)
and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#trust-boundaries-explicitly),
but the short version: an LLM verdict is a strong, fast, independently
reproducible signal — not a replacement for a professional audit, and not a
formal proof of safety.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Security issues should go through
[`SECURITY.md`](SECURITY.md) instead of a public issue.

## License

[MIT](LICENSE).
