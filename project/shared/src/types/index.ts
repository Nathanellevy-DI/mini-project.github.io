// User Types
export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
}

export interface UserRegistration {
    username: string;
    email: string;
    password: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

// Story Types
export interface Story {
    id: number;
    title: string;
    content: string;
    authorId: number;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    author?: User;
    collaborators?: Collaborator[];
}

export interface StoryCreate {
    title: string;
    content: string;
    isPublic: boolean;
}

export interface StoryUpdate {
    title?: string;
    content?: string;
    isPublic?: boolean;
}

// Collaborator Types
export interface Collaborator {
    userId: number;
    storyId: number;
    role: 'editor' | 'viewer';
    addedAt: Date;
    user?: User;
}

export interface CollaboratorAdd {
    userId: number;
    role: 'editor' | 'viewer';
}

// Comment Types
export interface Comment {
    id: number;
    storyId: number;
    userId: number;
    content: string;
    createdAt: Date;
    user?: User;
}

export interface CommentCreate {
    content: string;
}

// Auth Types
export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// Error Types
export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}
