"""Shared fixtures/constants for direct-mode tests of UpgradeSafetyChecker."""

import json

CONTRACT_PATH = "contracts/upgrade_safety_checker.py"

OLD_CID = "bafybeigdyrztold0000000000000000000000000000000000000safeold"
NEW_CID = "bafybeigdyrztnew0000000000000000000000000000000000000safenew"

OLD_SOURCE = "contract Vault { function withdraw() public onlyOwner { ... } }"
NEW_SOURCE = "contract Vault { function withdraw() public { ... } }"

ORACLE_PROMPT_PATTERN = r"ultra-conservative Web3 Security Oracle"


def llm_response(**overrides) -> str:
    payload = {
        "security_decreased": False,
        "risk_level": "LOW",
        "storage_collision_detected": False,
        "findings": [],
    }
    payload.update(overrides)
    return json.dumps(payload)


def mock_oracle_sources(direct_vm) -> None:
    direct_vm.mock_web(rf".*ipfs/{OLD_CID}.*", {"status": 200, "body": OLD_SOURCE})
    direct_vm.mock_web(rf".*ipfs/{NEW_CID}.*", {"status": 200, "body": NEW_SOURCE})
