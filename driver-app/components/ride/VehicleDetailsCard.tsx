import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { CarFront } from "lucide-react-native";

export function VehicleDetailsCard({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} className="px-6 mb-6">
      <Text className="text-white font-bold text-lg mb-3">Vehicle details</Text>
      <View className="bg-[#111111] rounded-3xl p-5 border border-white/5 shadow-sm flex-row items-center">
        <View className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 items-center justify-center mr-4">
          <CarFront size={24} color="#71717A" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-0.5">{ride.vehicle.number}</Text>
          <Text className="text-zinc-400 font-medium text-sm">
            {ride.vehicle.color} {ride.vehicle.brand} {ride.vehicle.model}
          </Text>
        </View>
        <View className="bg-zinc-800 px-3 py-1.5 rounded-lg border border-white/10">
          <Text className="text-zinc-300 font-bold text-xs uppercase tracking-wider">{ride.vehicle.type}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
