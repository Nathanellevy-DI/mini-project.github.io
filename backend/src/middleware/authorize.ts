import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

export const authorizeStoryAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id || req.params.storyId, 10);
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: 'Authentication required.',
            });
            return;
        }

        if (isNaN(storyId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid story ID.',
            });
            return;
        }

        // Check if user is the author or a collaborator
        const result = await pool.query(
            `SELECT s.id, s.author_id, s.is_public, c.role
       FROM stories s
       LEFT JOIN collaborators c ON s.id = c.story_id AND c.user_id = $1
       WHERE s.id = $2`,
            [userId, storyId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Story not found.',
            });
            return;
        }

        const story = result.rows[0];

        // Check access permissions
        const isAuthor = story.author_id === userId;
        const isCollaborator = story.role !== null;
        const isPublic = story.is_public;

        // For read access (GET requests)
        if (req.method === 'GET') {
            if (isAuthor || isCollaborator || isPublic) {
                next();
                return;
            }
        }

        // For write access (PUT, DELETE, POST)
        if (['PUT', 'PATCH', 'POST'].includes(req.method)) {
            // Only author and editors can modify
            if (isAuthor || story.role === 'editor') {
                next();
                return;
            }
        }

        // For delete access (DELETE)
        if (req.method === 'DELETE') {
            // Only author can delete
            if (isAuthor) {
                next();
                return;
            }
        }

        res.status(403).json({
            success: false,
            error: 'You do not have permission to perform this action.',
        });
    } catch (error) {
        console.error('Authorization error:', error);
        res.status(500).json({
            success: false,
            error: 'Authorization check failed.',
        });
    }
};
