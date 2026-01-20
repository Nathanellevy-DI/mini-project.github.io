import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database';
import { authLimiter } from '../config/security';
import { jwtConfig, bcryptRounds } from '../config/security';
import { registerSchema, loginSchema } from '../validation/authSchemas';
import { authenticate } from '../middleware/auth';

const router = Router();

// Helper function to generate tokens with proper types
const generateAccessToken = (payload: { id: number; email: string }): string => {
    const options: SignOptions = { expiresIn: '15m' };
    return jwt.sign(payload, jwtConfig.accessTokenSecret, options);
};

const generateRefreshToken = (payload: { id: number; email: string }): string => {
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload, jwtConfig.refreshTokenSecret, options);
};

// Register endpoint
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input using safeParse
        const validationResult = registerSchema.safeParse(req.body);

        if (!validationResult.success) {
            const errors: Record<string, string[]> = {};
            validationResult.error.errors.forEach((error) => {
                const path = error.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(error.message);
            });

            res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors,
            });
            return;
        }

        const { username, email, password } = validationResult.data;

        // Hash password
        const passwordHash = await bcrypt.hash(password, bcryptRounds);

        // Insert user into database
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, created_at`,
            [username, email, passwordHash]
        );

        const user = result.rows[0];

        // Generate tokens
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.created_at,
                },
                accessToken,
            },
            message: 'Registration successful',
        });
    } catch (error: unknown) {
        console.error('Registration error:', error);

        // Handle PostgreSQL unique constraint errors
        if (error && typeof error === 'object' && 'code' in error) {
            const pgError = error as { code: string; constraint?: string };
            if (pgError.code === '23505') {
                const field = pgError.constraint?.includes('email') ? 'email' : 'username';
                res.status(409).json({
                    success: false,
                    error: `This ${field} is already registered.`,
                });
                return;
            }
        }

        res.status(500).json({
            success: false,
            error: 'Registration failed. Please try again.',
        });
    }
});

// Login endpoint
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input using safeParse
        const validationResult = loginSchema.safeParse(req.body);

        if (!validationResult.success) {
            const errors: Record<string, string[]> = {};
            validationResult.error.errors.forEach((error) => {
                const path = error.path.join('.');
                if (!errors[path]) {
                    errors[path] = [];
                }
                errors[path].push(error.message);
            });

            res.status(400).json({
                success: false,
                error: 'Validation failed',
                errors,
            });
            return;
        }

        const { email, password } = validationResult.data;

        // Find user by email
        const result = await pool.query(
            `SELECT id, username, email, password_hash, created_at
       FROM users
       WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }

        // Generate tokens
        const accessToken = generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

        // Set refresh token as HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    createdAt: user.created_at,
                },
                accessToken,
            },
            message: 'Login successful',
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed. Please try again.',
        });
    }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            res.status(401).json({
                success: false,
                error: 'Refresh token not found',
            });
            return;
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret) as {
            id: number;
            email: string;
        };

        // Generate new access token
        const accessToken = generateAccessToken({ id: decoded.id, email: decoded.email });

        res.json({
            success: true,
            data: { accessToken },
            message: 'Token refreshed successfully',
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired refresh token',
        });
    }
});

// Logout endpoint
router.post('/logout', authenticate, async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken');
    res.json({
        success: true,
        message: 'Logout successful',
    });
});

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, created_at
       FROM users
       WHERE id = $1`,
            [req.user?.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        res.json({
            success: true,
            data: {
                user: result.rows[0],
            },
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user',
        });
    }
});

export default router;
