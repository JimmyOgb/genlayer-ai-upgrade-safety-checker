/**
 * Mirrors the dict returned by UpgradeSafetyChecker.get_audit_result()
 * in contracts/upgrade_safety_checker.py — keep these in sync.
 */
export type RiskLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "";

export interface AuditResult {
  has_audited: boolean;
  is_approved: boolean;
  security_decreased: boolean;
  risk_level: RiskLevel;
  storage_collision: boolean;
  findings: string[];
  old_code_cid: string;
  new_code_cid: string;
}

export const EMPTY_AUDIT_RESULT: AuditResult = {
  has_audited: false,
  is_approved: false,
  security_decreased: true,
  risk_level: "",
  storage_collision: false,
  findings: [],
  old_code_cid: "",
  new_code_cid: "",
};
