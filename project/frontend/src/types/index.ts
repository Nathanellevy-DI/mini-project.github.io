// User types
export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: string;
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

// Story types
export interface Story {
    id: number;
    title: string;
    content: string;
    authorId: number;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
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

// Collaborator types
export interface Collaborator {
    userId: number;
    storyId: number;
    role: 'editor' | 'viewer';
    addedAt: string;
    user?: User;
}

// Comment types
export interface Comment {
    id: number;
    storyId: number;
    userId: number;
    content: string;
    createdAt: string;
    user?: User;
}
