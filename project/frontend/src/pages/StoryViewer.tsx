import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStory, deleteStory } from '../store/storySlice';
import type { RootState, AppDispatch } from '../store/store';

const StoryViewer: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { currentStory, loading, error } = useSelector((state: RootState) => state.stories);
    const { user } = useSelector((state: RootState) => state.auth);

    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchStory(parseInt(id)));
        }
    }, [dispatch, id]);

    const isAuthor = currentStory?.authorId === user?.id;

    // Get the shareable URL
    const getShareUrl = () => {
        const baseUrl = window.location.origin;
        return `${baseUrl}/story/${id}`;
    };

    // Social sharing functions
    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareToTwitter = () => {
        const text = `Check out this story: "${currentStory?.title}"`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(getShareUrl())}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareToLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareToWhatsApp = () => {
        const text = `Check out this story: "${currentStory?.title}" - ${getShareUrl()}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
            if (id) {
                await dispatch(deleteStory(parseInt(id)));
                navigate('/dashboard');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error || !currentStory) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body text-center">
                        <h2 className="card-title justify-center">Story Not Found</h2>
                        <p>{error || 'The story you are looking for does not exist.'}</p>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary mt-4">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
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
                    {/* Share Button */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="btn btn-ghost btn-circle"
                            onClick={() => setShowShareMenu(!showShareMenu)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </label>
                        {showShareMenu && (
                            <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                                <li className="menu-title"><span>Share Story</span></li>
                                <li><button onClick={shareToFacebook}>📘 Facebook</button></li>
                                <li><button onClick={shareToTwitter}>🐦 Twitter</button></li>
                                <li><button onClick={shareToLinkedIn}>💼 LinkedIn</button></li>
                                <li><button onClick={shareToWhatsApp}>💬 WhatsApp</button></li>
                                <li className="divider"></li>
                                <li>
                                    <button onClick={copyLink}>
                                        {copied ? '✅ Copied!' : '🔗 Copy Link'}
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>

                    {isAuthor && (
                        <>
                            <button onClick={() => navigate(`/stories/${id}/edit`)} className="btn btn-ghost btn-sm">
                                ✏️ Edit
                            </button>
                            <button onClick={handleDelete} className="btn btn-ghost btn-sm text-error">
                                🗑️ Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 max-w-4xl">
                <article className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        {/* Story Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{currentStory.title}</h1>
                                <div className="flex items-center gap-4 text-base-content/60">
                                    <span>By {currentStory.author?.username || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{new Date(currentStory.createdAt).toLocaleDateString()}</span>
                                    <div className="badge badge-outline">
                                        {currentStory.isPublic ? '🌐 Public' : '🔒 Private'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Story Content */}
                        <div className="prose prose-lg max-w-none">
                            {currentStory.content.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>

                        {/* Share Section at Bottom */}
                        <div className="divider mt-8">Share this story</div>
                        <div className="flex justify-center gap-4">
                            <button onClick={shareToFacebook} className="btn btn-circle btn-outline">
                                <span className="text-xl">📘</span>
                            </button>
                            <button onClick={shareToTwitter} className="btn btn-circle btn-outline">
                                <span className="text-xl">🐦</span>
                            </button>
                            <button onClick={shareToLinkedIn} className="btn btn-circle btn-outline">
                                <span className="text-xl">💼</span>
                            </button>
                            <button onClick={shareToWhatsApp} className="btn btn-circle btn-outline">
                                <span className="text-xl">💬</span>
                            </button>
                            <button onClick={copyLink} className="btn btn-circle btn-outline">
                                <span className="text-xl">{copied ? '✅' : '🔗'}</span>
                            </button>
                        </div>
                        {copied && (
                            <div className="text-center text-success mt-2">Link copied to clipboard!</div>
                        )}
                    </div>
                </article>
            </div>
        </div>
    );
};

export default StoryViewer;
