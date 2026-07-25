export interface AuthResponse {
  token: string;
  refreshToken: string;
  driver: import('./driver').Driver;
}

export interface OTPVerifyRequest {
  phone: string;
  otp: string;
}

export interface LoginRequest {
  phone: string;
  password?: string;
}
