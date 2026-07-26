import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Navigation, Phone, MapPin, MapPinned } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useRouter } from "expo-router";
import { useRideStore } from "@/store/useRideStore";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function CurrentRideCard() {
  const router = useRouter();
  const { currentRide } = useRideStore();
  const hasActiveRide = !!currentRide && currentRide.status !== "completed" && currentRide.status !== "cancelled"; 

  if (!hasActiveRide) {
    return (
      <Animated.View entering={FadeInDown.delay(1000).duration(500).springify()} className="px-6 mb-6">
        <View className="bg-[#111111] rounded-3xl p-8 border border-white/5 items-center justify-center">
          <View className="w-16 h-16 bg-zinc-900 rounded-full items-center justify-center mb-4">
            <Navigation size={24} color="#EAB308" />
          </View>
          <Text className="text-xl font-bold text-white mb-2 text-center">No active ride right now</Text>
          <Text className="text-sm text-zinc-400 text-center">You're ready for the next booking.</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(1000).duration(500).springify()} className="px-6 mb-6">
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.push("/ride/current")}
        className="bg-[#111111] rounded-3xl p-1 border border-white/5 shadow-lg"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-5 pb-4 border-b border-white/5">
          <View>
            <Text className="text-xs text-zinc-400 font-bold mb-1 uppercase tracking-wider">Current Ride</Text>
            <Text className="text-white font-bold text-lg">{currentRide.bookingNumber}</Text>
          </View>
          <View className="bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
            <Text className="text-yellow-500 font-bold text-xs uppercase tracking-wider">{currentRide.status}</Text>
          </View>
        </View>

        {/* Route Info */}
        <View className="p-5">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center mr-4">
              <MapPin size={20} color="#71717A" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-zinc-500 font-medium mb-0.5">Pickup</Text>
              <Text className="text-white font-semibold text-base">{currentRide.pickup.address}</Text>
            </View>
          </View>

          <View className="absolute left-[39px] top-[48px] w-0.5 h-6 bg-zinc-800" />

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-yellow-500/10 items-center justify-center mr-4">
              <MapPinned size={20} color="#EAB308" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-zinc-500 font-medium mb-0.5">Drop-off</Text>
              <Text className="text-white font-semibold text-base">{currentRide.destination.address}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="p-3 bg-zinc-900/50 rounded-b-[28px] flex-row gap-3">
          <TouchableOpacity className="w-14 h-14 bg-zinc-800 rounded-2xl items-center justify-center">
            <Phone size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Button 
            className="flex-1 rounded-2xl shadow-none"
            onPress={() => router.push("/ride/current")}
          >
            Manage Trip
          </Button>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
