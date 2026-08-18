export interface SmtpSettings {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}

export interface PaymentGatewaySettings {
  provider?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  sessionTimeout: number;
  loginAttemptLimit: number;
  jwtTokenDuration: string;
  refreshTokenDuration: string;
}

export interface NotificationSettings {
  enableEmailNotifications: boolean;
  bookingNotifications: boolean;
  driverNotifications: boolean;
  paymentNotifications: boolean;
  documentNotifications: boolean;
  systemNotifications: boolean;
}

export interface LongDistanceSettings {
  advanceAmount: number;
  advancePercentage: number;
  isPercentageBased: boolean;
  minAdvanceAmount: number;
  allowedEarlyStartWindow: number;
  minBookingLeadTime: number;
  cancellationRules?: string;
  refundRules?: string;
}

export interface Settings {
  _id: string;
  companyName: string;
  companyEmail: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  officeAddress: string;
  gstNumber?: string;
  panNumber?: string;
  currency: string;
  timezone: string;
  invoicePrefix: string;
  bookingPrefix: string;
  logo?: string;
  favicon?: string;
  smtpSettings?: SmtpSettings;
  paymentGatewaySettings?: PaymentGatewaySettings;
  securitySettings?: SecuritySettings;
  notificationSettings?: NotificationSettings;
  longDistanceSettings?: LongDistanceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface SystemStatus {
  Environment: string;
  ApplicationVersion: string;
  DatabaseStatus: 'Healthy' | 'Warning' | 'Critical';
  APIStatus: 'Healthy' | 'Warning' | 'Critical';
  SocketStatus: 'Healthy' | 'Warning' | 'Critical';
  ServerUptime: string;
  StorageUsage: string;
  MemoryUsage: string;
  CPUUsage: string;
  DiskUsage: string;
}
