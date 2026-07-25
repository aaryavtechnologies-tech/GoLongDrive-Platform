import React from "react";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Text className="text-2xl font-bold text-white mb-6">Home Screen (Phase 2)</Text>
      <Button onPress={handleLogout} variant="outline" className="w-full">
        Logout
      </Button>
    </View>
  );
}
