import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { MapPin, MapPinned, Copy, Navigation2 } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LocationCardProps {
  type: "pickup" | "destination";
  ride: Ride;
  delay?: number;
}

export function LocationCard({ type, ride, delay = 300 }: LocationCardProps) {
  const isPickup = type === "pickup";
  const location = isPickup ? ride.pickup : ride.destination;
  const title = isPickup ? "Pickup Location" : "Drop-off Location";
  const iconColor = isPickup ? "#71717A" : "#EAB308";
  
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()} className="px-6 mb-4">
      <Text className="text-white font-bold text-lg mb-3">{title}</Text>
      
      <View className="bg-[#111111] rounded-3xl p-5 border border-white/5 shadow-sm">
        <View className="flex-row gap-4">
          <View className={cn(
            "w-12 h-12 rounded-full items-center justify-center border border-white/5",
            isPickup ? "bg-zinc-900" : "bg-yellow-500/10"
          )}>
            {isPickup ? <MapPin size={22} color={iconColor} /> : <MapPinned size={22} color={iconColor} />}
          </View>
          
          <View className="flex-1 justify-center">
            <Text className="text-white font-bold text-base mb-1">{location.address}</Text>
            {location.landmark && (
              <Text className="text-zinc-400 text-sm font-medium mb-1">Near {location.landmark}</Text>
            )}
            <Text className="text-zinc-500 text-xs font-medium">
              {location.city}, {location.state} {location.pincode}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-end gap-3 mt-4 pt-4 border-t border-white/5">
          <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 bg-zinc-900 rounded-lg">
            <Copy size={14} color="#A1A1AA" />
            <Text className="text-zinc-300 font-semibold text-xs">Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 rounded-lg">
            <Navigation2 size={14} color="#EAB308" />
            <Text className="text-yellow-500 font-bold text-xs">Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
