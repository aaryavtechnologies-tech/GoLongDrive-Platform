import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const API_URL = "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 and refresh token logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          // Attempt to refresh token
          const res = await axios.post(`${API_URL}/driver/refresh-token`, { refreshToken });
          
          if (res.data?.token) {
            useAuthStore.getState().setAuth(
              useAuthStore.getState().driver!,
              res.data.token,
              res.data.refreshToken || refreshToken
            );
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, logout user
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);
