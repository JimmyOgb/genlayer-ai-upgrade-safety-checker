# Contributing

Thanks for considering a contribution. This is a small project — a single
Intelligent Contract plus a dashboard — so the bar is "does it make the
audit verdict more trustworthy, or the dashboard easier to use," not
"does it add a feature."

## Project layout

```
contracts/    the UpgradeSafetyChecker Intelligent Contract (Python / GenVM)
tests/direct/      fast, offline unit tests (mocked web + LLM)
tests/integration/ tests against a live network (real LLM calls)
deploy/       genlayer-js deploy script
frontend/     the dashboard (Vite + React + TypeScript + Tailwind)
```

## Setting up

```bash
git clone <your-fork-url>
cd ai-upgrade-safety-checker

# contract + tests
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# frontend
npm install   # installs the frontend workspace too
cp frontend/.env.example frontend/.env
```

## Working on the contract

- Keep `contracts/upgrade_safety_checker.py` as the single source of truth;
  the live Studio deployment and the frontend's TypeScript types
  (`frontend/src/types/contract.ts`) both need to stay in sync with whatever
  shape `get_audit_result()` returns.
- Run the fast checks before opening a PR:
  ```bash
  ruff check contracts/ tests/
  genvm-lint lint contracts/upgrade_safety_checker.py
  pytest tests/direct -v
  ```
  (`pytest tests/direct` downloads a matching GenVM SDK build on first run,
  cached afterward in `~/.cache/gltest-direct` — this needs outbound
  internet access once.)
- If you change the contract's interface (new method, changed return shape),
  update `contracts/README.md` and `frontend/src/types/contract.ts` in the
  same PR.
- Changes to the audit prompt itself are the most consequential kind of
  change here — they alter what "Approved" means. Call this out explicitly
  in the PR description.

## Working on the frontend

```bash
cd frontend
npm run dev      # local dev server
npm run build    # type-check + production build
```

Follow the existing design language (the case-file/tribunal aesthetic in
`tailwind.config.ts` and `src/index.css`) rather than introducing a
different visual system for new components.

## Pull requests

- Keep PRs focused — one logical change per PR.
- Describe what you tested and how (direct tests, integration tests against
  studionet, manual dashboard testing, etc.).
- Update the relevant README section if behavior visible to users changes.

## Reporting bugs / proposing features

Open a GitHub issue. For anything touching the audit prompt's security
judgment, include a concrete before/after code example so reviewers can
reason about the change instead of guessing at intent.

Security issues should go through [`SECURITY.md`](SECURITY.md) instead of a
public issue.
