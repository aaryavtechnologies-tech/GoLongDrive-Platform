import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { socketService } from "@/services/socket.service";

import "./global.css"; // NativeWind v4 css

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: require("../assets/fonts/SpaceMono-Regular.ttf"), // Placeholder for Inter
  });

  const { token, isLoading, restoreToken } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Restore token on mount
  useEffect(() => {
    restoreToken();
  }, []);

  // Handle fonts
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  // Auth routing logic
  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [fontsLoaded, isLoading]);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const inOnboarding = segments[0] === "(onboarding)";

    // Very basic routing logic: if no token, go to auth.
    // If token, go to tabs.
    // Real implementation would check "hasSeenOnboarding" flag in local storage.
    if (!token && !inAuthGroup && !inOnboarding) {
      // For now, redirect to login directly. Onboarding can be triggered manually or via flag.
      router.replace("/(auth)/login");
    } else if (token && !inTabsGroup) {
      router.replace("/(tabs)");
    }
  }, [token, isReady, segments]);

  // Manage socket connection
  useEffect(() => {
    if (token) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }
    return () => socketService.disconnect();
  }, [token]);

  if (!isReady) {
    return null; // or a custom splash screen component if we want
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
