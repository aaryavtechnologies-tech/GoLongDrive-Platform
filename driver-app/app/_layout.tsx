import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { socketService } from "@/services/socket.service";
import { LoadingScreen } from "@/components/ui/LoadingScreen";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter: require("../assets/fonts/SpaceMono-Regular.ttf"), // Placeholder for Inter
  });

  const { token, isLoading, restoreToken, hasSeenOnboarding } = useAuthStore();
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

    // Routing Logic:
    // 1. If user hasn't seen onboarding, show it
    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace("/(onboarding)");
      return;
    }
    
    // 2. If no token, go to auth
    if (hasSeenOnboarding && !token && !inAuthGroup && !inOnboarding) {
      router.replace("/(auth)/login");
      return;
    } 
    
    // 3. If token, go to tabs
    if (token && !inTabsGroup) {
      router.replace("/(tabs)");
      return;
    }
  }, [token, isReady, segments, hasSeenOnboarding]);

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
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </QueryClientProvider>
  );
}
