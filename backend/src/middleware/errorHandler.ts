import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    // Zod validation errors
    if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};

        err.errors.forEach((error) => {
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

    // PostgreSQL errors
    if ('code' in err) {
        const pgError = err as any;

        // Unique constraint violation
        if (pgError.code === '23505') {
            const field = pgError.constraint?.includes('email') ? 'email' : 'username';
            res.status(409).json({
                success: false,
                error: `This ${field} is already registered.`,
            });
            return;
        }

        // Foreign key violation
        if (pgError.code === '23503') {
            res.status(400).json({
                success: false,
                error: 'Invalid reference. The referenced resource does not exist.',
            });
            return;
        }
    }

    // Default error response (don't expose internal details in production)
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
        success: false,
        error: 'An unexpected error occurred. Please try again later.',
        ...(isDevelopment && { details: err.message, stack: err.stack }),
    });
};
