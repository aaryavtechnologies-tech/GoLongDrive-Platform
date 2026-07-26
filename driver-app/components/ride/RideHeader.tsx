import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function RideHeader({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} className="px-6 pt-16 pb-6 border-b border-white/5">
      <View className="flex-row items-center justify-between mb-4">
        <View className="bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20">
          <Text className="text-yellow-500 font-bold text-xs uppercase tracking-wider">
            {ride.status === "assigned" && "New Trip Assigned"}
            {ride.status === "accepted" && "Trip Accepted"}
            {ride.status === "arrived" && "Driver Arrived"}
            {ride.status === "started" && "Trip in Progress"}
            {ride.status === "completed" && "Trip Completed"}
          </Text>
        </View>
        <Text className="text-zinc-500 text-sm font-semibold">{ride.bookingNumber}</Text>
      </View>
      
      <Text className="text-3xl font-extrabold text-white mb-1 tracking-tight">
        {ride.tripType}
      </Text>
      <Text className="text-base text-zinc-400 font-medium">
        {ride.pickupTime} Pickup
      </Text>
    </Animated.View>
  );
}
