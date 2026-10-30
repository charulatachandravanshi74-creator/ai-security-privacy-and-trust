import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['Admin', 'Auditor', 'Developer']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const scanSchema = z.object({
  scanType: z.string().min(2, 'Scan type is required'),
  inputContent: z.string().min(5, 'Input content must be at least 5 characters')
});

export const complianceSchema = z.object({
  framework: z.string().min(2, 'Compliance framework is required'),
  scopeDescription: z.string().min(10, 'Scope description must be at least 10 characters')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ScanInput = z.infer<typeof scanSchema>;
export type ComplianceInput = z.infer<typeof complianceSchema>;
