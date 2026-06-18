"""
Direct-mode tests for UpgradeSafetyChecker.
Run with: pytest tests/direct -v
"""

import pytest

from tests.direct.conftest import (
    CONTRACT_PATH,
    NEW_CID,
    OLD_CID,
    ORACLE_PROMPT_PATTERN,
    llm_response,
    mock_oracle_sources,
)


class TestInitialState:
    def test_fresh_deployment_is_unaudited(self, direct_deploy):
        contract = direct_deploy(CONTRACT_PATH)
        result = contract.get_audit_result()

        assert result == {
            "has_audited": False,
            "is_approved": False,
            "security_decreased": True,
            "risk_level": "",
            "storage_collision": False,
            "findings": [],
            "old_code_cid": "",
            "new_code_cid": "",
        }


class TestApprovalLogic:
    def test_safe_upgrade_is_approved(self, direct_vm, direct_deploy):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, llm_response())
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)
        result = contract.get_audit_result()

        assert result["has_audited"] is True
        assert result["is_approved"] is True
        assert result["risk_level"] == "LOW"
        assert result["old_code_cid"] == OLD_CID
        assert result["new_code_cid"] == NEW_CID

    def test_medium_risk_with_no_regression_is_still_approved(
        self, direct_vm, direct_deploy
    ):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, llm_response(risk_level="MEDIUM"))
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        assert contract.get_audit_result()["is_approved"] is True

    @pytest.mark.parametrize("risk_level", ["HIGH", "CRITICAL"])
    def test_high_or_critical_risk_is_rejected(
        self, direct_vm, direct_deploy, risk_level
    ):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, llm_response(risk_level=risk_level))
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        assert contract.get_audit_result()["is_approved"] is False

    def test_security_decreased_rejects_even_at_low_risk(
        self, direct_vm, direct_deploy
    ):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(
            ORACLE_PROMPT_PATTERN,
            llm_response(security_decreased=True, risk_level="LOW"),
        )
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        assert contract.get_audit_result()["is_approved"] is False

    def test_storage_collision_is_recorded_independently_of_approval(
        self, direct_vm, direct_deploy
    ):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(
            ORACLE_PROMPT_PATTERN,
            llm_response(storage_collision_detected=True, risk_level="HIGH"),
        )
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)
        result = contract.get_audit_result()

        assert result["storage_collision"] is True
        assert result["is_approved"] is False


class TestFindings:
    def test_findings_round_trip_as_list(self, direct_vm, direct_deploy):
        findings = [
            "Access modifier removed from withdraw()",
            "Reentrancy guard dropped in transferFrom()",
        ]
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(
            ORACLE_PROMPT_PATTERN,
            llm_response(security_decreased=True, risk_level="HIGH", findings=findings),
        )
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        assert contract.get_audit_result()["findings"] == findings


class TestResponseParsing:
    def test_markdown_fenced_response_is_parsed(self, direct_vm, direct_deploy):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, llm_response(risk_level="NONE"))
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        assert contract.get_audit_result()["risk_level"] == "NONE"

    def test_missing_fields_fall_back_to_safe_defaults(
        self, direct_vm, direct_deploy
    ):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, "{}")
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)
        result = contract.get_audit_result()

        assert result["security_decreased"] is True
        assert result["risk_level"] == "CRITICAL"
        assert result["is_approved"] is False


class TestOneShotGate:
    def test_cannot_audit_the_same_deployment_twice(self, direct_vm, direct_deploy):
        mock_oracle_sources(direct_vm)
        direct_vm.mock_llm(ORACLE_PROMPT_PATTERN, llm_response())
        contract = direct_deploy(CONTRACT_PATH)

        contract.run_audit(OLD_CID, NEW_CID)

        with direct_vm.expect_revert("Already audited"):
            contract.run_audit(OLD_CID, NEW_CID)
