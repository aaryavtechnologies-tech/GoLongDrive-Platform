import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ShieldAlert, HeadphonesIcon } from "lucide-react-native";

export function RideSupportCard() {
  return (
    <Animated.View entering={FadeInDown.delay(700).duration(500).springify()} className="px-6 mb-32">
      <Text className="text-white font-bold text-lg mb-3">Safety & Support</Text>
      <View className="flex-row gap-4">
        <TouchableOpacity activeOpacity={0.8} className="flex-1 bg-[#111111] rounded-3xl p-5 border border-white/5 items-center justify-center">
          <View className="w-12 h-12 bg-red-500/10 rounded-full items-center justify-center mb-3">
            <ShieldAlert size={22} color="#EF4444" />
          </View>
          <Text className="text-white font-bold text-sm">Emergency</Text>
        </TouchableOpacity>
        
        <TouchableOpacity activeOpacity={0.8} className="flex-1 bg-[#111111] rounded-3xl p-5 border border-white/5 items-center justify-center">
          <View className="w-12 h-12 bg-blue-500/10 rounded-full items-center justify-center mb-3">
            <HeadphonesIcon size={22} color="#3B82F6" />
          </View>
          <Text className="text-white font-bold text-sm">Support</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
