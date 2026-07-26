import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";

export function DashboardHeader() {
  const driver = useAuthStore((state) => state.driver);

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} className="flex-row items-center justify-between px-6 pt-16 pb-4">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full overflow-hidden border border-yellow-500/20 bg-card">
          <Image 
            source={require("../../assets/images/logo.jpeg")} 
            className="w-full h-full" 
            contentFit="cover" 
          />
        </View>
        <View>
          <Text className="text-zinc-400 text-sm font-medium">Good Evening,</Text>
          <Text className="text-white text-xl font-bold">{driver?.firstName || "Partner"}</Text>
        </View>
      </View>

      <TouchableOpacity className="w-12 h-12 rounded-full bg-card items-center justify-center border border-border relative">
        <Bell size={22} color="#FFFFFF" />
        <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-yellow-500 rounded-full border-2 border-card" />
      </TouchableOpacity>
    </Animated.View>
  );
}
