import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';
import type { Story, StoryCreate, StoryUpdate } from '../types';

// Story state interface
interface StoryState {
    stories: Story[];
    currentStory: Story | null;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: StoryState = {
    stories: [],
    currentStory: null,
    loading: false,
    error: null,
};

// Async thunks
export const fetchStories = createAsyncThunk(
    'stories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/stories');
            return response.data.data.stories || [];
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                return rejectWithValue(axiosError.response?.data?.error || 'Failed to fetch stories');
            }
            return rejectWithValue('Failed to fetch stories');
        }
    }
);

export const fetchStory = createAsyncThunk(
    'stories/fetchOne',
    async (id: number, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/stories/${id}`);
            return response.data.data.story;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                return rejectWithValue(axiosError.response?.data?.error || 'Failed to fetch story');
            }
            return rejectWithValue('Failed to fetch story');
        }
    }
);

export const createStory = createAsyncThunk(
    'stories/create',
    async (storyData: StoryCreate, { rejectWithValue }) => {
        try {
            const response = await axios.post('/stories', storyData);
            return response.data.data.story;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                return rejectWithValue(axiosError.response?.data?.error || 'Failed to create story');
            }
            return rejectWithValue('Failed to create story');
        }
    }
);

export const updateStory = createAsyncThunk(
    'stories/update',
    async ({ id, data }: { id: number; data: StoryUpdate }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/stories/${id}`, data);
            return response.data.data.story;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                return rejectWithValue(axiosError.response?.data?.error || 'Failed to update story');
            }
            return rejectWithValue('Failed to update story');
        }
    }
);

export const deleteStory = createAsyncThunk(
    'stories/delete',
    async (id: number, { rejectWithValue }) => {
        try {
            await axios.delete(`/stories/${id}`);
            return id;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { data?: { error?: string } } };
                return rejectWithValue(axiosError.response?.data?.error || 'Failed to delete story');
            }
            return rejectWithValue('Failed to delete story');
        }
    }
);

// Story slice
const storySlice = createSlice({
    name: 'stories',
    initialState,
    reducers: {
        clearCurrentStory: (state) => {
            state.currentStory = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch all stories
        builder
            .addCase(fetchStories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.loading = false;
                state.stories = action.payload;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Fetch single story
        builder
            .addCase(fetchStory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStory.fulfilled, (state, action) => {
                state.loading = false;
                state.currentStory = action.payload;
            })
            .addCase(fetchStory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create story
        builder
            .addCase(createStory.fulfilled, (state, action) => {
                state.stories.unshift(action.payload);
            });

        // Update story
        builder
            .addCase(updateStory.fulfilled, (state, action) => {
                const index = state.stories.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.stories[index] = action.payload;
                }
                if (state.currentStory?.id === action.payload.id) {
                    state.currentStory = action.payload;
                }
            });

        // Delete story
        builder
            .addCase(deleteStory.fulfilled, (state, action) => {
                state.stories = state.stories.filter(s => s.id !== action.payload);
                if (state.currentStory?.id === action.payload) {
                    state.currentStory = null;
                }
            });
    },
});

export const { clearCurrentStory, clearError } = storySlice.actions;
export default storySlice.reducer;
