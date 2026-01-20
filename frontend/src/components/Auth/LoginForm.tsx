import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/authSlice';
import type { RootState, AppDispatch } from '../../store/store';

const LoginForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) dispatch(clearError());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = await dispatch(login(formData));

        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title text-2xl font-bold text-center">Welcome Back</h2>

                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input input-bordered"
                            required
                        />
                    </div>

                    <div className="form-control mt-6">
                        <button
                            type="submit"
                            className={`btn btn-primary ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>

                <div className="divider">OR</div>

                <button
                    onClick={() => navigate('/register')}
                    className="btn btn-ghost btn-sm"
                >
                    Don't have an account? Register
                </button>
            </div>
        </div>
    );
};

export default LoginForm;
