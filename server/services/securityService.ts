import { ai, GEMINI_MODEL, hasGeminiApiKey } from '../config/gemini.ts';
import type { DetectedThreat, PIIFoundItem, ThreatSeverity } from '../../src/types/index.ts';

const SYSTEM_INSTRUCTION = `You are TrustShield AI, an elite cybersecurity, data privacy, and AI trust compliance auditor. Your mandate is to meticulously analyze code, text, configuration files, and data payloads for security vulnerabilities, PII leakage, compliance gaps, and trust risks. Output all analytical results strictly in valid JSON format matching the requested schema without markdown code block wrappers.`;

export interface ScanResult {
  risk_score: number;
  detected_threats: DetectedThreat[];
  pii_found: PIIFoundItem[];
  remediation_steps: string[];
  sanitized_content: string;
}

// Client sanitization & regex rules for PII & credentials
export function sanitizeAndDetectPII(content: string): { sanitized: string; pii: PIIFoundItem[] } {
  const piiList: PIIFoundItem[] = [];
  let text = content;

  // 1. Social Security Numbers (SSN): 3-2-4 digits
  const ssnRegex = /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g;
  text = text.replace(ssnRegex, (match) => {
    const masked = `***-**-${match.slice(-4)}`;
    piiList.push({
      pii_type: 'Social Security Number (SSN)',
      masked_value: masked,
      risk_level: 'Critical'
    });
    return masked;
  });

  // 2. Credit Card numbers (13-19 digits, separated or continuous)
  const ccRegex = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g;
  text = text.replace(ccRegex, (match) => {
    const masked = `****-****-****-${match.slice(-4)}`;
    piiList.push({
      pii_type: 'Credit Card (PAN)',
      masked_value: masked,
      risk_level: 'Critical'
    });
    return masked;
  });

  // Also dashed credit cards like 4532-8921-3920-1123
  const ccDashedRegex = /\b\d{4}[- ]\d{4}[- ]\d{4}[- ]\d{4}\b/g;
  text = text.replace(ccDashedRegex, (match) => {
    const clean = match.replace(/[- ]/g, '');
    const masked = `****-****-****-${clean.slice(-4)}`;
    if (!piiList.some(p => p.masked_value === masked)) {
      piiList.push({
        pii_type: 'Payment Card Number',
        masked_value: masked,
        risk_level: 'Critical'
      });
    }
    return masked;
  });

  // 3. AWS Access Key IDs
  const awsKeyRegex = /\b(AKIA[0-9A-Z]{16})\b/g;
  text = text.replace(awsKeyRegex, (match) => {
    const masked = `${match.substring(0, 4)}****************`;
    piiList.push({
      pii_type: 'AWS Access Key ID',
      masked_value: masked,
      risk_level: 'Critical'
    });
    return masked;
  });

  // 4. Generic API Keys / Secrets / Tokens in assignments (e.g. api_key = "...", secret = '...')
  const apiSecretRegex = /(api[_-]?key|secret[_-]?key|auth[_-]?token|private[_-]?key|bearer\s+)[:=]\s*["']?([a-zA-Z0-9_\-\.]{16,64})["']?/gi;
  text = text.replace(apiSecretRegex, (fullMatch, label, secret) => {
    const masked = `${secret.substring(0, 3)}***REDACTED_SECRET***`;
    piiList.push({
      pii_type: 'API Secret / Authentication Token',
      masked_value: `${label}: "${masked}"`,
      risk_level: 'High'
    });
    return `${label}: "${masked}"`;
  });

  // 5. Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
  text = text.replace(emailRegex, (match) => {
    const parts = match.split('@');
    const masked = `${parts[0].charAt(0)}***@${parts[1]}`;
    piiList.push({
      pii_type: 'Personal Email Address',
      masked_value: masked,
      risk_level: 'Medium'
    });
    return masked;
  });

  // 6. JSON diagnosis / medical data
  const medicalRegex = /"(diagnosis|condition|treatment|medicalRecord)":\s*"([^"]+)"/gi;
  text = text.replace(medicalRegex, (fullMatch, key, val) => {
    piiList.push({
      pii_type: 'Protected Health Information (PHI)',
      masked_value: `${key}: "[REDACTED_PHI]"`,
      risk_level: 'High'
    });
    return `"${key}": "[REDACTED_PHI]"`;
  });

  return { sanitized: text, pii: piiList };
}

// Local heuristic analysis fallback for instant results or missing key
function localAnalyzeSecurity(content: string, scanType: string): ScanResult {
  const { sanitized, pii } = sanitizeAndDetectPII(content);
  const threats: DetectedThreat[] = [];
  const remediation: string[] = [];
  let riskScore = 15;

  const lower = content.toLowerCase();

  // SQL Injection check
  if (
    /select\s+.*\s+from\s+.*(where|\$|#|\+)/i.test(content) ||
    /or\s+['"]?1['"]?\s*=\s*['"]?1/i.test(content) ||
    /\$\{[^}]*req\.(query|body|params)/i.test(content) ||
    /exec\s*\(/i.test(content)
  ) {
    threats.push({
      type: 'SQL Injection Vulnerability',
      severity: 'Critical',
      description: 'Raw SQL query concatenation or parameter interpolation detected without parameterized bindings.',
      cwe_id: 'CWE-89',
      location: 'Database query statement'
    });
    remediation.push('Utilize parameterized prepared statements ($1, ?), query builders, or an ORM.');
    riskScore += 45;
  }

  // Hardcoded secrets / keys
  if (/akia[0-9a-z]{16}/i.test(content) || /private[_-]?key/i.test(content) || /BEGIN RSA PRIVATE KEY/i.test(content)) {
    threats.push({
      type: 'Hardcoded Cryptographic Secret / Cloud Key',
      severity: 'Critical',
      description: 'Production credentials or private keys committed directly in code/payload.',
      cwe_id: 'CWE-798',
      location: 'Constant literal assignment'
    });
    remediation.push('Revoke exposed credentials and rotate them immediately.');
    remediation.push('Inject secrets at runtime via cloud secret managers (KMS, Vault) or environment variables.');
    riskScore += 50;
  }

  // Cross-Site Scripting (XSS)
  if (/innerHTML\s*=|dangerouslySetInnerHTML|document\.write\s*\(|<script\b/i.test(content)) {
    threats.push({
      type: 'Cross-Site Scripting (XSS) Pattern',
      severity: 'High',
      description: 'Direct insertion of untrusted data into DOM without contextual HTML encoding.',
      cwe_id: 'CWE-79',
      location: 'DOM manipulation'
    });
    remediation.push('Use DOMPurify or framework built-in escaping to sanitize markup.');
    riskScore += 30;
  }

  // Prompt Injection
  if (
    /ignore\s+(all\s+)?(previous|prior)\s+(instructions|rules|prompts)/i.test(content) ||
    /system\s*prompt\s*leak/i.test(content) ||
    /you\s+are\s+now\s+dan\b/i.test(content) ||
    /reveal\s+(secret|hidden|system)\s+prompt/i.test(content)
  ) {
    threats.push({
      type: 'LLM Prompt Injection / Jailbreak Vector',
      severity: 'High',
      description: 'Adversarial instruction override designed to circumvent AI alignment and safety guardrails.',
      cwe_id: 'CWE-1384',
      location: 'Prompt input payload'
    });
    remediation.push('Wrap untrusted input in strict delimiter blocks with input firewall validation.');
    remediation.push('Verify output with guardrail models before returning to end-users.');
    riskScore += 35;
  }

  // Insecure Deserialization / eval
  if (/eval\s*\(|new\s+Function\s*\(|unserialize\s*\(/i.test(content)) {
    threats.push({
      type: 'Arbitrary Code Execution / Insecure Evaluation',
      severity: 'Critical',
      description: 'Dynamic execution of untrusted string code via eval() or dynamic function constructor.',
      cwe_id: 'CWE-95',
      location: 'Execution construct'
    });
    remediation.push('Replace dynamic eval with safe JSON.parse() or strictly typed parsers.');
    riskScore += 45;
  }

  // Check for PII presence impacts
  if (pii.length > 0) {
    riskScore += Math.min(pii.length * 15, 40);
    if (!remediation.includes('Enforce automated PII anonymization and masking at the edge.')) {
      remediation.push('Enforce automated PII anonymization and masking at the edge.');
    }
  }

  if (threats.length === 0 && pii.length === 0) {
    riskScore = 8;
    threats.push({
      type: 'No Active Critical Vulnerabilities',
      severity: 'Informational',
      description: 'Baseline input review passed standard security and privacy filters without identifying high-risk vectors.'
    });
    remediation.push('Maintain regular continuous scanning and automated static code analysis.');
  }

  return {
    risk_score: Math.min(100, Math.max(0, riskScore)),
    detected_threats: threats,
    pii_found: pii,
    remediation_steps: remediation,
    sanitized_content: sanitized
  };
}

export async function runSecurityScan(inputContent: string, scanType: string): Promise<ScanResult> {
  // First run local PII detection & masking
  const { sanitized, pii: detectedLocalPii } = sanitizeAndDetectPII(inputContent);

  if (!hasGeminiApiKey) {
    console.log('ℹ️ Running TrustShield native threat engine (GEMINI_API_KEY not configured).');
    return localAnalyzeSecurity(inputContent, scanType);
  }

  try {
    const prompt = `Analyze the following input text/code for security vulnerabilities, compliance risks, and PII exposure.

Scan Type: ${scanType}

Input:
${inputContent}

Return a JSON object conforming strictly to this schema:
{
  "risk_score": number (0-100),
  "detected_threats": [
    {
      "type": string,
      "severity": "Critical" | "High" | "Medium" | "Low",
      "description": string
    }
  ],
  "pii_found": [
    {
      "pii_type": string,
      "masked_value": string
    }
  ],
  "remediation_steps": [string]
}`;

    const callWithTimeout = Promise.race([
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json'
        }
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout after 7000ms')), 7000)
      )
    ]);

    const response = await callWithTimeout;

    const text = response.text?.trim() || '{}';
    // Clean potential markdown blocks if returned
    const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    // Merge any locally detected PII to ensure zero false negatives on strict patterns
    const mergedPii: PIIFoundItem[] = [...(parsed.pii_found || [])];
    for (const localP of detectedLocalPii) {
      if (!mergedPii.some(p => p.masked_value === localP.masked_value)) {
        mergedPii.push(localP);
      }
    }

    const threats: DetectedThreat[] = (parsed.detected_threats || []).map((t: any) => ({
      type: t.type || 'Security Concern',
      severity: (['Critical', 'High', 'Medium', 'Low', 'Informational'].includes(t.severity)
        ? t.severity
        : 'Medium') as ThreatSeverity,
      description: t.description || 'Identified security or privacy anomaly.'
    }));

    const remediation: string[] = Array.isArray(parsed.remediation_steps)
      ? parsed.remediation_steps
      : ['Apply least-privilege security controls and input sanitization.'];

    let riskScore = typeof parsed.risk_score === 'number' ? parsed.risk_score : 50;
    if (threats.some(t => t.severity === 'Critical') && riskScore < 80) {
      riskScore = 88;
    }

    return {
      risk_score: Math.min(100, Math.max(0, riskScore)),
      detected_threats: threats,
      pii_found: mergedPii,
      remediation_steps: remediation,
      sanitized_content: sanitized
    };
  } catch (err: any) {
    console.error('Gemini API security scan encountered error, using native fallback engine:', err.message);
    return localAnalyzeSecurity(inputContent, scanType);
  }
}
