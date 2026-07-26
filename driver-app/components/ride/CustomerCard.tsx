import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { Phone, MessageSquare, Star } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function CustomerCard({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} className="px-6 mb-4">
      <Text className="text-white font-bold text-lg mb-3">Passenger</Text>
      <View className="bg-[#111111] rounded-3xl p-4 flex-row items-center justify-between border border-white/5 shadow-sm">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-zinc-800 items-center justify-center mr-3 border border-white/10">
            <Text className="text-white font-bold text-lg">
              {ride.customer.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="text-white font-bold text-base mb-0.5">{ride.customer.name}</Text>
            <View className="flex-row items-center">
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text className="text-zinc-400 text-sm font-medium ml-1">{ride.customer.rating}</Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row gap-2">
          <TouchableOpacity className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center border border-white/10">
            <MessageSquare size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-yellow-500 items-center justify-center">
            <Phone size={18} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
