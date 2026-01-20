import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createStory, updateStory, fetchStory, clearCurrentStory } from '../store/storySlice';
import type { RootState, AppDispatch } from '../store/store';

const StoryEditor: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = Boolean(id);

    const { currentStory, loading, error } = useSelector((state: RootState) => state.stories);
    const { user } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPublic: false,
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEditing && id) {
            dispatch(fetchStory(parseInt(id)));
        }
        return () => {
            dispatch(clearCurrentStory());
        };
    }, [dispatch, id, isEditing]);

    useEffect(() => {
        if (currentStory && isEditing) {
            setFormData({
                title: currentStory.title,
                content: currentStory.content,
                isPublic: currentStory.isPublic,
            });
        }
    }, [currentStory, isEditing]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEditing && id) {
                await dispatch(updateStory({ id: parseInt(id), data: formData }));
            } else {
                await dispatch(createStory(formData));
            }
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to save story:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading && isEditing) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <button onClick={() => navigate('/dashboard')} className="btn btn-ghost normal-case text-xl">
                        ← Back to Stories
                    </button>
                </div>
                <div className="flex-none gap-2">
                    <div className="badge badge-primary">
                        {user?.username}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 max-w-4xl">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-2xl">
                            {isEditing ? 'Edit Story' : 'Create New Story'}
                        </h2>

                        {error && (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">Title</span>
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="input input-bordered input-lg"
                                    placeholder="Enter your story title..."
                                    required
                                    minLength={1}
                                    maxLength={200}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-lg">Content</span>
                                </label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="textarea textarea-bordered h-64 text-base"
                                    placeholder="Write your story here..."
                                    required
                                    minLength={1}
                                    maxLength={50000}
                                />
                                <label className="label">
                                    <span className="label-text-alt">
                                        {formData.content.length} / 50,000 characters
                                    </span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer justify-start gap-4">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                        className="checkbox checkbox-primary"
                                    />
                                    <span className="label-text text-lg">
                                        Make this story public
                                    </span>
                                </label>
                                <span className="label-text-alt ml-10">
                                    {formData.isPublic
                                        ? '🌐 Anyone can read this story'
                                        : '🔒 Only you and collaborators can read this story'}
                                </span>
                            </div>

                            <div className="card-actions justify-end pt-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${saving ? 'loading' : ''}`}
                                    disabled={saving || !formData.title.trim() || !formData.content.trim()}
                                >
                                    {saving
                                        ? 'Saving...'
                                        : isEditing
                                            ? 'Update Story'
                                            : 'Create Story'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryEditor;
