import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, MapPin, ChevronRight, Clock } from "lucide-react-native";

export function UpcomingRideCard() {
  const hasUpcoming = true; // Mock

  if (!hasUpcoming) return null;

  return (
    <Animated.View entering={FadeInDown.delay(1100).duration(500).springify()} className="px-6 mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white font-bold text-lg">Upcoming Ride</Text>
        <TouchableOpacity>
          <Text className="text-yellow-500 font-semibold text-sm">View All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.8} className="bg-[#111111] rounded-3xl p-5 border border-white/5 flex-row items-center shadow-sm">
        <View className="w-14 h-14 bg-zinc-900 rounded-2xl items-center justify-center mr-4 border border-white/5">
          <Calendar size={24} color="#EAB308" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base mb-1">Tomorrow, 10:00 AM</Text>
          <View className="flex-row items-center">
            <MapPin size={14} color="#71717A" />
            <Text className="text-zinc-400 text-sm ml-1" numberOfLines={1}>Bangalore to Ooty</Text>
          </View>
        </View>
        <View className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center">
          <ChevronRight size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
