import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
            <div className="text-center max-w-4xl">
                <h1 className="text-6xl font-bold text-white mb-6">
                    📖 StoryTeller
                </h1>
                <p className="text-2xl text-white/90 mb-8">
                    Collaborative Storytelling Platform
                </p>
                <p className="text-lg text-white/80 mb-12 max-w-2xl mx-auto">
                    Create, share, and collaborate on stories with friends.
                    Write together in real-time, add collaborators, and bring your stories to life.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/register')}
                        className="btn btn-lg btn-accent"
                    >
                        Get Started
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-lg btn-outline btn-accent"
                    >
                        Login
                    </button>
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                        <div className="text-4xl mb-4">✍️</div>
                        <h3 className="text-xl font-bold mb-2">Write Together</h3>
                        <p className="text-white/80">Collaborate with others on your stories in real-time</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                        <div className="text-4xl mb-4">🔒</div>
                        <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                        <p className="text-white/80">Your stories are protected with enterprise-grade security</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
                        <div className="text-4xl mb-4">🌐</div>
                        <h3 className="text-xl font-bold mb-2">Share Easily</h3>
                        <p className="text-white/80">Make stories public or keep them private with collaborators</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
