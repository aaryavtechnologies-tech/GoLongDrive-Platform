import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { MapPin, Navigation, Clock } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function RideStatusCard({ ride }: { ride: Ride }) {
  
  let icon = <Navigation size={24} color="#EAB308" />;
  let title = "Navigate to Pickup";
  let subtitle = "12 mins away • 4.5 km";

  if (ride.status === "arrived") {
    icon = <Clock size={24} color="#EAB308" />;
    title = "Waiting for customer";
    subtitle = "Wait time: 02:45 mins";
  } else if (ride.status === "started") {
    icon = <MapPin size={24} color="#22C55E" />;
    title = "Navigating to Drop-off";
    subtitle = "45 mins away • 22 km";
  } else if (ride.status === "completed") {
    icon = <MapPin size={24} color="#71717A" />;
    title = "Trip Completed";
    subtitle = "You have reached the destination";
  }

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} className="px-6 mt-6 mb-6">
      <View className="bg-[#111111] rounded-3xl p-6 border border-white/5 shadow-lg flex-row items-center">
        <View className={cn(
          "w-14 h-14 rounded-full items-center justify-center mr-4",
          ride.status === "completed" ? "bg-zinc-900" : "bg-yellow-500/10"
        )}>
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-white mb-1">{title}</Text>
          <Text className="text-sm font-medium text-zinc-400">{subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
