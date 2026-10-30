import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.ts';
import { signToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { registerSchema, loginSchema, type RegisterInput, type LoginInput } from '../middleware/schemas.ts';

const router = Router();

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password, fullName, role } = req.body as RegisterInput;

  try {
    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await db.createUser({
      email,
      password_hash,
      full_name: fullName,
      role: role || 'Developer',
      organization: 'TrustShield Cloud'
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as LoginInput;

  try {
    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organization: user.organization,
        createdAt: user.createdAt
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

export default router;
