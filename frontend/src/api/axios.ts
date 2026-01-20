import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken, logout } from '../store/authSlice';

const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true, // Important for cookies
});

// Request interceptor - attach access token
axiosInstance.interceptors.request.use(
    (config) => {
        const state = store.getState();
        const token = state.auth.accessToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const response = await axios.post('/api/auth/refresh', {}, {
                    withCredentials: true,
                });

                const { accessToken } = response.data.data;

                // Update token in store
                store.dispatch(setAccessToken(accessToken));

                // Retry the original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                store.dispatch(logout());
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
