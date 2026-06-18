"""
Integration tests — require a live GenLayer network (studionet or localnet)
and make real LLM calls. Unlike tests/direct, nothing here is mocked.

Run with:
    gltest tests/integration -v -s

The first test only checks the deterministic initial state (cheap, no LLM
call). The second actually triggers run_audit() against two real IPFS CIDs
and therefore costs real validator/LLM time — fill in OLD_CID/NEW_CID with
CIDs for two small text files you control before running it, and expect it
to take noticeably longer than a typical chain write.
"""

import pytest
from gltest import get_contract_factory
from gltest.helpers import load_fixture
from gltest.assertions import tx_execution_succeeded

# Fill these in with real IPFS CIDs before running test_run_audit_reaches_consensus.
OLD_CID = ""
NEW_CID = ""


@pytest.mark.integration
def deploy_contract():
    factory = get_contract_factory("UpgradeSafetyChecker")
    contract = factory.deploy()

    initial_state = contract.get_audit_result(args=[])
    assert initial_state["has_audited"] is False

    return contract


@pytest.mark.integration
def test_initial_state_on_chain():
    contract = load_fixture(deploy_contract)

    state = contract.get_audit_result(args=[])
    assert state == {
        "has_audited": False,
        "is_approved": False,
        "security_decreased": True,
        "risk_level": "",
        "storage_collision": False,
        "findings": [],
        "old_code_cid": "",
        "new_code_cid": "",
    }


@pytest.mark.integration
@pytest.mark.skipif(
    not OLD_CID or not NEW_CID,
    reason="Set OLD_CID and NEW_CID to real IPFS CIDs to run a live audit",
)
def test_run_audit_reaches_consensus():
    contract = load_fixture(deploy_contract)

    run_audit_result = contract.run_audit(
        args=[OLD_CID, NEW_CID],
        wait_interval=10000,
        wait_retries=30,
    )
    assert tx_execution_succeeded(run_audit_result)

    state = contract.get_audit_result(args=[])
    assert state["has_audited"] is True
    assert state["old_code_cid"] == OLD_CID
    assert state["new_code_cid"] == NEW_CID
    assert state["risk_level"] in ("NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL")
