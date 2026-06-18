# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *

import json
import typing


class UpgradeSafetyChecker(gl.Contract):
    has_audited:        bool
    is_approved:        bool
    risk_level:         str
    findings:           str   # JSON-encoded list of strings
    security_decreased: bool
    storage_collision:  bool
    old_code_cid:       str
    new_code_cid:       str

    def __init__(self):
        self.has_audited        = False
        self.is_approved        = False
        self.risk_level         = ""
        self.findings           = "[]"
        self.security_decreased = True
        self.storage_collision  = False
        self.old_code_cid       = ""
        self.new_code_cid       = ""

    @gl.public.write
    def run_audit(self, old_code_cid: str, new_code_cid: str) -> typing.Any:

        if self.has_audited:
            raise gl.vm.UserError("Already audited")

        old_url = "https://dweb.link/ipfs/" + old_code_cid
        new_url = "https://dweb.link/ipfs/" + new_code_cid

        def get_audit_result() -> typing.Any:
            old_code = gl.nondet.web.render(old_url, mode="text")
            new_code = gl.nondet.web.render(new_url, mode="text")

            task = f"""
You are an ultra-conservative Web3 Security Oracle.
Compare the two smart-contract versions below and detect if upgrading from the
old version to the new version introduces security regressions.

=== OLD CONTRACT (pre-upgrade) ===
{old_code}

=== NEW CONTRACT (post-upgrade) ===
{new_code}

Check for:
1. Storage Layout Collisions - have existing variable orderings or types changed?
2. Authorization Bypasses - are access-control checks missing or weakened?
3. Business Logic Vulnerabilities - new reentrancy, overflow, or logic bugs?

Respond with the following JSON format:
{{
    "security_decreased": bool,
    "risk_level": str,
    "storage_collision_detected": bool,
    "findings": list
}}

Rules:
- "risk_level" must be one of: "NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"
- "findings" is a list of short strings describing each issue found
- Set "security_decreased" to true if the upgrade makes the protocol LESS safe
- It is mandatory that you respond only using the JSON format above,
  nothing else. Don't include any other words or characters,
  your output must be only JSON without any formatting prefix or suffix.
  This result should be perfectly parsable by a JSON parser without errors.
            """

            result = (
                gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "")
            )
            print(result)
            return json.loads(result)

        result_json = gl.eq_principle.strict_eq(get_audit_result)

        self.has_audited        = True
        self.old_code_cid       = old_code_cid
        self.new_code_cid       = new_code_cid
        self.security_decreased = bool(result_json.get("security_decreased", True))
        self.risk_level         = str(result_json.get("risk_level", "CRITICAL"))
        self.storage_collision  = bool(result_json.get("storage_collision_detected", False))
        self.findings           = json.dumps(result_json.get("findings", []))

        self.is_approved = (
            not self.security_decreased
            and self.risk_level not in ("HIGH", "CRITICAL")
        )

        return result_json

    @gl.public.view
    def get_audit_result(self) -> dict[str, typing.Any]:
        return {
            "has_audited":        self.has_audited,
            "is_approved":        self.is_approved,
            "security_decreased": self.security_decreased,
            "risk_level":         self.risk_level,
            "storage_collision":  self.storage_collision,
            "findings":           json.loads(self.findings),
            "old_code_cid":       self.old_code_cid,
            "new_code_cid":       self.new_code_cid,
        }
