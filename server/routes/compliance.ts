import { Router } from 'express';
import { db } from '../config/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { complianceSchema, type ComplianceInput } from '../middleware/schemas.ts';
import { runComplianceAssessment } from '../services/complianceService.ts';
import type { ComplianceFramework } from '../../src/types/index.ts';

const router = Router();

// POST /api/compliance/assess
router.post('/assess', requireAuth, validateBody(complianceSchema), async (req: AuthenticatedRequest, res) => {
  const { framework, scopeDescription } = req.body as ComplianceInput;
  const user = req.user!;

  try {
    const assessment = await runComplianceAssessment(
      framework as ComplianceFramework,
      scopeDescription,
      user.fullName
    );

    const audit = await db.createComplianceAudit({
      user_id: user.id,
      user_email: user.email,
      framework: framework,
      status: assessment.status,
      evaluation_summary: assessment.summary,
      report_details: assessment.details
    });

    res.status(201).json({ audit });
  } catch (err: any) {
    console.error('Compliance assessment error:', err);
    res.status(500).json({ error: 'Failed to generate compliance assessment.' });
  }
});

// GET /api/compliance/reports
router.get('/reports', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  try {
    const audits = await db.getComplianceAudits(user.id, user.role);
    res.json({ audits });
  } catch (err: any) {
    console.error('Fetch compliance audits error:', err);
    res.status(500).json({ error: 'Could not retrieve compliance audit records.' });
  }
});

export default router;
