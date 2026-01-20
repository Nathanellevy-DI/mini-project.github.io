import { z } from 'zod';

// Create story schema
export const createStorySchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),
    content: z
        .string()
        .min(1, 'Content is required')
        .max(50000, 'Content must not exceed 50,000 characters'),
    isPublic: z
        .boolean()
        .default(false),
});

// Update story schema (all fields optional)
export const updateStorySchema = z.object({
    title: z
        .string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must not exceed 200 characters')
        .trim()
        .optional(),
    content: z
        .string()
        .min(1, 'Content cannot be empty')
        .max(50000, 'Content must not exceed 50,000 characters')
        .optional(),
    isPublic: z
        .boolean()
        .optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});

// Add collaborator schema
export const addCollaboratorSchema = z.object({
    userId: z
        .number()
        .int()
        .positive('User ID must be a positive integer'),
    role: z
        .enum(['editor', 'viewer'], {
            errorMap: () => ({ message: 'Role must be either "editor" or "viewer"' }),
        })
        .default('viewer'),
});

// Comment schema
export const createCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(1000, 'Comment must not exceed 1,000 characters')
        .trim(),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>;
export type UpdateStoryInput = z.infer<typeof updateStorySchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
