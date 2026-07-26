import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { Driver } from "../types/driver";

interface AuthState {
  driver: Driver | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isSignout: boolean;
  hasSeenOnboarding: boolean;
  setAuth: (driver: Driver, token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const DRIVER_KEY = "driver_info";
const ONBOARDING_KEY = "has_seen_onboarding";

export const useAuthStore = create<AuthState>((set, get) => ({
  driver: null,
  token: null,
  refreshToken: null,
  isLoading: true,
  isSignout: false,
  hasSeenOnboarding: false,

  setAuth: async (driver, token, refreshToken) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(DRIVER_KEY, JSON.stringify(driver));
      
      set({ driver, token, refreshToken, isSignout: false });
    } catch (error) {
      console.error("Error saving auth state", error);
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
      set({ hasSeenOnboarding: true });
    } catch (error) {
      console.error("Error saving onboarding state", error);
    }
  },

  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(DRIVER_KEY);
      
      set({ driver: null, token: null, refreshToken: null, isSignout: true });
    } catch (error) {
      console.error("Error clearing auth state", error);
    }
  },

  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      const driverStr = await SecureStore.getItemAsync(DRIVER_KEY);
      const onboardingStr = await SecureStore.getItemAsync(ONBOARDING_KEY);
      
      const hasSeenOnboarding = onboardingStr === "true";

      if (token && refreshToken && driverStr) {
        set({
          token,
          refreshToken,
          driver: JSON.parse(driverStr),
          hasSeenOnboarding,
          isLoading: false,
        });
      } else {
        set({ 
          hasSeenOnboarding,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Error restoring auth state", error);
      set({ isLoading: false });
    }
  },
}));
