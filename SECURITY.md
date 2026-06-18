# Security Policy

This repository is itself about smart-contract security review, so it
deserves precision about what's actually covered here.

## Scope

- **This repo's code** (the Intelligent Contract, the deploy script, the
  dashboard) — report issues with this code under "Reporting" below.
- **`UpgradeSafetyChecker`'s verdicts are not a security audit.** The
  contract asks an LLM to compare two code samples and produce a structured
  opinion. Treat an "Approved" stamp as one fast, transparent, independently
  reproducible signal — not a substitute for a manual review or a
  professional audit firm. See [`contracts/README.md`](contracts/README.md#known-limitations-by-design-and-worth-being-explicit-about)
  for the specific limitations.
- **GenLayer protocol-level security** (consensus, GenVM, the validator set)
  is out of scope here — report that upstream at
  [genlayerlabs/genlayer-studio](https://github.com/genlayerlabs/genlayer-studio)
  or via GenLayer's own security contact.

## Reporting a vulnerability

If you find a security issue in this repo's own code — for example, a way to
make `run_audit` reach a misleading verdict through means other than the
LLM's judgment, a flaw in the one-shot `has_audited` gate, or an XSS-style
issue in how the dashboard renders on-chain data — please open a
[GitHub Security Advisory](../../security/advisories/new) on this repository
rather than a public issue, so it can be reviewed before details are public.

Please include:
- The contract method or frontend component affected.
- Steps to reproduce, including any specific IPFS CIDs or inputs used.
- What you expected versus what happened.

We aim to acknowledge reports within a few days. This is a small,
community-maintained project rather than an organization with a dedicated
security team, so response times will vary.

## Supported versions

There is one moving target: the `main` branch. There are no maintained
release branches at this time.

## Known dependency advisories (frontend)

`npm audit` currently reports a `ws` (WebSocket) memory-exhaustion advisory
with **no fix available**, pulled in transitively via `viem` ← `genlayer-js`.
This is upstream of this repo — there's nothing to patch here short of
forking `genlayer-js`. It affects a dev/runtime WebSocket dependency, not
this dashboard's own code. Re-run `npm audit` periodically; once
`genlayer-js` bumps `viem` past the affected `ws` range, `npm update` should
clear it.
