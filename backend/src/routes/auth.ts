import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { authLimiter } from '../config/security';
import { jwtConfig, bcryptRounds } from '../config/security';
import { registerSchema, loginSchema } from '../validation/authSchemas';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register endpoint
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validatedData = registerSchema.parse(req.body);
        const { username, email, password } = validatedData;

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
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            jwtConfig.accessTokenSecret,
            { expiresIn: jwtConfig.accessTokenExpiry }
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            jwtConfig.refreshTokenSecret,
            { expiresIn: jwtConfig.refreshTokenExpiry }
        );

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
    } catch (error) {
        throw error; // Let error handler middleware handle it
    }
});

// Login endpoint
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate input
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

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
        const accessToken = jwt.sign(
            { id: user.id, email: user.email },
            jwtConfig.accessTokenSecret,
            { expiresIn: jwtConfig.accessTokenExpiry }
        );

        const refreshToken = jwt.sign(
            { id: user.id, email: user.email },
            jwtConfig.refreshTokenSecret,
            { expiresIn: jwtConfig.refreshTokenExpiry }
        );

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
        throw error;
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
        const accessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            jwtConfig.accessTokenSecret,
            { expiresIn: jwtConfig.accessTokenExpiry } as jwt.SignOptions
        );

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
        throw error;
    }
});

export default router;
