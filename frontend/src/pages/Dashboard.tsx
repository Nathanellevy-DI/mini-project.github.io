import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchStories } from '../store/storySlice';
import { logout } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store/store';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const { stories, loading } = useSelector((state: RootState) => state.stories);

    useEffect(() => {
        dispatch(fetchStories());
    }, [dispatch]);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Navbar */}
            <div className="navbar bg-base-100 shadow-lg">
                <div className="flex-1">
                    <a className="btn btn-ghost normal-case text-xl">📖 StoryTeller</a>
                </div>
                <div className="flex-none gap-2">
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                                <span>{user?.username.charAt(0).toUpperCase()}</span>
                            </div>
                        </label>
                        <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52">
                            <li className="menu-title">
                                <span>{user?.username}</span>
                            </li>
                            <li><a onClick={handleLogout}>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">My Stories</h1>
                    <button
                        onClick={() => navigate('/stories/new')}
                        className="btn btn-primary"
                    >
                        + New Story
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">No stories yet</h2>
                            <p>Start creating your first story!</p>
                            <button
                                onClick={() => navigate('/stories/new')}
                                className="btn btn-primary mt-4"
                            >
                                Create Story
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stories.map((story) => (
                            <div
                                key={story.id}
                                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                                onClick={() => navigate(`/stories/${story.id}`)}
                            >
                                <div className="card-body">
                                    <h2 className="card-title">{story.title}</h2>
                                    <p className="line-clamp-3">{story.content}</p>
                                    <div className="card-actions justify-between items-center mt-4">
                                        <div className="badge badge-outline">
                                            {story.isPublic ? '🌐 Public' : '🔒 Private'}
                                        </div>
                                        <span className="text-sm text-base-content/60">
                                            {new Date(story.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
