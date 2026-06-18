"""Shared fixtures/constants for direct-mode tests of UpgradeSafetyChecker."""

CONTRACT_PATH = "contracts/upgrade_safety_checker.py"

OLD_CID = "bafybeigdyrztold0000000000000000000000000000000000000safeold"
NEW_CID = "bafybeigdyrztnew0000000000000000000000000000000000000safenew"

OLD_SOURCE = "contract Vault { function withdraw() public onlyOwner { ... } }"
NEW_SOURCE = "contract Vault { function withdraw() public { ... } }"

# Matches the static framing text in run_audit()'s prompt, independent of
# the interpolated old/new source bodies — see contracts/upgrade_safety_checker.py
ORACLE_PROMPT_PATTERN = r"ultra-conservative Web3 Security Oracle"


def mock_oracle_sources(direct_vm) -> None:
    """Register web mocks for both IPFS gateway fetches `run_audit` performs."""
    direct_vm.mock_web(rf".*ipfs/{OLD_CID}.*", {"status": 200, "body": OLD_SOURCE})
    direct_vm.mock_web(rf".*ipfs/{NEW_CID}.*", {"status": 200, "body": NEW_SOURCE})
