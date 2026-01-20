import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';
import { authorizeStoryAccess } from '../middleware/authorize';
import { createCommentSchema } from '../validation/storySchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all comments for a story
router.get('/stories/:storyId/comments', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.storyId, 10);

        const result = await pool.query(
            `SELECT c.id, c.story_id, c.user_id, c.content, c.created_at,
              u.username, u.email
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.story_id = $1
       ORDER BY c.created_at DESC`,
            [storyId]
        );

        res.json({
            success: true,
            data: {
                comments: result.rows,
            },
        });
    } catch (error) {
        throw error;
    }
});

// Create a comment on a story
router.post('/stories/:storyId/comments', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.storyId, 10);
        const userId = req.user?.id;
        const validatedData = createCommentSchema.parse(req.body);
        const { content } = validatedData;

        const result = await pool.query(
            `INSERT INTO comments (story_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, story_id, user_id, content, created_at`,
            [storyId, userId, content]
        );

        res.status(201).json({
            success: true,
            data: {
                comment: result.rows[0],
            },
            message: 'Comment added successfully',
        });
    } catch (error) {
        throw error;
    }
});

// Delete a comment
router.delete('/comments/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const userId = req.user?.id;

        // Check if comment exists and belongs to user
        const result = await pool.query(
            'SELECT user_id FROM comments WHERE id = $1',
            [commentId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Comment not found',
            });
            return;
        }

        if (result.rows[0].user_id !== userId) {
            res.status(403).json({
                success: false,
                error: 'You can only delete your own comments',
            });
            return;
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

        res.json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        throw error;
    }
});

export default router;
