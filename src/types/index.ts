export type UserRole = 'Admin' | 'Auditor' | 'Developer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ThreatSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface DetectedThreat {
  type: string;
  severity: ThreatSeverity;
  description: string;
  cwe_id?: string;
  location?: string;
}

export interface PIIFoundItem {
  pii_type: string;
  masked_value: string;
  original_value?: string;
  risk_level?: ThreatSeverity;
}

export interface SecurityScan {
  id: string;
  user_id: string;
  user_email?: string;
  scan_type: string; // e.g. 'Code Snippet', 'API Payload', 'Config File', 'Prompt & Data'
  input_content: string;
  risk_score: number; // 0-100
  detected_threats: DetectedThreat[];
  pii_found: PIIFoundItem[];
  remediation_steps: string[];
  sanitized_content?: string;
  created_at: string;
}

export type ComplianceFramework = 'GDPR' | 'HIPAA' | 'SOC 2' | 'ISO 27001';

export type ComplianceStatus = 'Compliant' | 'Needs Review' | 'Critical Gaps' | 'Passed with Warnings';

export interface ComplianceControlItem {
  control_id: string;
  title: string;
  status: 'Pass' | 'Fail' | 'Partial';
  finding: string;
  recommendation: string;
}

export interface ComplianceReportDetails {
  scope_description: string;
  framework: ComplianceFramework;
  risk_score: number;
  overall_status: ComplianceStatus;
  key_findings: string[];
  controls_evaluated: ComplianceControlItem[];
  remediation_checklist: string[];
  assessed_by?: string;
}

export interface ComplianceAudit {
  id: string;
  user_id: string;
  user_email?: string;
  framework: string;
  status: ComplianceStatus;
  evaluation_summary: string;
  report_details: ComplianceReportDetails;
  created_at: string;
}

export interface DashboardStats {
  totalScans: number;
  avgRiskScore: number;
  criticalThreatsCount: number;
  piiLeaksPrevented: number;
  activeComplianceCount: number;
  recentScans: SecurityScan[];
  severityBreakdown: { severity: string; count: number; color: string }[];
  scansTimeline: { date: string; scans: number; threats: number }[];
  topPiiTypes: { type: string; count: number }[];
  complianceScoreByFramework: { framework: string; score: number; status: string }[];
}
