import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';
import { authorizeStoryAccess } from '../middleware/authorize';
import {
    createStorySchema,
    updateStorySchema,
    addCollaboratorSchema,
} from '../validation/storySchemas';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all stories (user's own + public + collaborated)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const result = await pool.query(
            `SELECT DISTINCT s.id, s.title, s.content, s.author_id, s.is_public, 
              s.created_at, s.updated_at,
              u.username as author_username,
              u.email as author_email
       FROM stories s
       JOIN users u ON s.author_id = u.id
       LEFT JOIN collaborators c ON s.id = c.story_id
       WHERE s.author_id = $1 
          OR s.is_public = true 
          OR c.user_id = $1
       ORDER BY s.updated_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: {
                stories: result.rows,
            },
        });
    } catch (error) {
        throw error;
    }
});

// Get single story by ID
router.get('/:id', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id, 10);

        const result = await pool.query(
            `SELECT s.id, s.title, s.content, s.author_id, s.is_public, 
              s.created_at, s.updated_at,
              u.username as author_username,
              u.email as author_email
       FROM stories s
       JOIN users u ON s.author_id = u.id
       WHERE s.id = $1`,
            [storyId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Story not found',
            });
            return;
        }

        // Get collaborators
        const collaboratorsResult = await pool.query(
            `SELECT c.user_id, c.role, c.added_at,
              u.username, u.email
       FROM collaborators c
       JOIN users u ON c.user_id = u.id
       WHERE c.story_id = $1`,
            [storyId]
        );

        const story = {
            ...result.rows[0],
            collaborators: collaboratorsResult.rows,
        };

        res.json({
            success: true,
            data: { story },
        });
    } catch (error) {
        throw error;
    }
});

// Create new story
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = createStorySchema.parse(req.body);
        const { title, content, isPublic } = validatedData;
        const userId = req.user?.id;

        const result = await pool.query(
            `INSERT INTO stories (title, content, author_id, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, author_id, is_public, created_at, updated_at`,
            [title, content, userId, isPublic]
        );

        res.status(201).json({
            success: true,
            data: {
                story: result.rows[0],
            },
            message: 'Story created successfully',
        });
    } catch (error) {
        throw error;
    }
});

// Update story
router.put('/:id', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id, 10);
        const validatedData = updateStorySchema.parse(req.body);

        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (validatedData.title !== undefined) {
            updates.push(`title = $${paramCount++}`);
            values.push(validatedData.title);
        }

        if (validatedData.content !== undefined) {
            updates.push(`content = $${paramCount++}`);
            values.push(validatedData.content);
        }

        if (validatedData.isPublic !== undefined) {
            updates.push(`is_public = $${paramCount++}`);
            values.push(validatedData.isPublic);
        }

        values.push(storyId);

        const result = await pool.query(
            `UPDATE stories
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, title, content, author_id, is_public, created_at, updated_at`,
            values
        );

        res.json({
            success: true,
            data: {
                story: result.rows[0],
            },
            message: 'Story updated successfully',
        });
    } catch (error) {
        throw error;
    }
});

// Delete story
router.delete('/:id', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id, 10);

        await pool.query('DELETE FROM stories WHERE id = $1', [storyId]);

        res.json({
            success: true,
            message: 'Story deleted successfully',
        });
    } catch (error) {
        throw error;
    }
});

// Add collaborator to story
router.post('/:id/collaborators', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id, 10);
        const validatedData = addCollaboratorSchema.parse(req.body);
        const { userId, role } = validatedData;

        // Check if user exists
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }

        // Add collaborator
        await pool.query(
            `INSERT INTO collaborators (story_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (story_id, user_id) 
       DO UPDATE SET role = $3`,
            [storyId, userId, role]
        );

        res.status(201).json({
            success: true,
            message: 'Collaborator added successfully',
        });
    } catch (error) {
        throw error;
    }
});

// Remove collaborator from story
router.delete('/:id/collaborators/:userId', authorizeStoryAccess, async (req: Request, res: Response): Promise<void> => {
    try {
        const storyId = parseInt(req.params.id, 10);
        const userId = parseInt(req.params.userId, 10);

        await pool.query(
            'DELETE FROM collaborators WHERE story_id = $1 AND user_id = $2',
            [storyId, userId]
        );

        res.json({
            success: true,
            message: 'Collaborator removed successfully',
        });
    } catch (error) {
        throw error;
    }
});

export default router;
