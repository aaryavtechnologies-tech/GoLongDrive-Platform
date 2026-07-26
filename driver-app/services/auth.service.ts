import { api } from "./api";
import { AuthResponse, LoginRequest, OTPVerifyRequest } from "../types/auth";
import { Driver } from "../types/driver";

export const AuthService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<AuthResponse>("/driver/login", data);
    return response.data;
  },

  sendOtp: async (phone: string) => {
    const response = await api.post("/driver/send-otp", { phone });
    return response.data;
  },

  verifyOtp: async (data: OTPVerifyRequest) => {
    const response = await api.post<AuthResponse>("/driver/verify-otp", data);
    return response.data;
  },

  resetPassword: async (password: string) => {
    const response = await api.post("/driver/reset-password", { password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get<Driver>("/driver/profile");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/driver/logout");
    return response.data;
  },

  registerDriver: async (data: any) => {
    // Mock registration API
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  },

  uploadDocument: async (fileUri: string, type: string) => {
    // Mock file upload API
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, url: fileUri }), 1000));
  },
};
