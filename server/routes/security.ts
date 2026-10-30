import { Router } from 'express';
import { db } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { scanSchema, type ScanInput } from '../middleware/schemas.ts';
import { runSecurityScan, sanitizeAndDetectPII } from '../services/securityService.ts';

const router = Router();

// POST /api/security/scan
router.post('/scan', requireAuth, validateBody(scanSchema), async (req: AuthenticatedRequest, res) => {
  const { scanType, inputContent } = req.body as ScanInput;
  const user = req.user!;

  try {
    const analysis = await runSecurityScan(inputContent, scanType);

    const savedScan = await db.createSecurityScan({
      user_id: user.id,
      user_email: user.email,
      scan_type: scanType,
      input_content: inputContent,
      risk_score: analysis.risk_score,
      detected_threats: analysis.detected_threats,
      pii_found: analysis.pii_found,
      remediation_steps: analysis.remediation_steps
    });

    res.status(201).json({
      scan: {
        ...savedScan,
        sanitized_content: analysis.sanitized_content
      }
    });
  } catch (err: any) {
    console.error('Security scan execution error:', err);
    res.status(500).json({ error: 'Failed to process security scan. Please check input format and try again.' });
  }
});

// GET /api/security/scans
router.get('/scans', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  try {
    const scans = await db.getSecurityScans(user.id, user.role);
    res.json({ scans });
  } catch (err: any) {
    console.error('Fetch scans error:', err);
    res.status(500).json({ error: 'Could not retrieve scan history.' });
  }
});

// POST /api/security/quick-redact
router.post('/quick-redact', requireAuth, (req, res) => {
  const content = req.body.content;
  if (typeof content !== 'string') {
    res.status(400).json({ error: 'Payload must contain a string "content".' });
    return;
  }
  const result = sanitizeAndDetectPII(content);
  res.json(result);
});

export default router;
