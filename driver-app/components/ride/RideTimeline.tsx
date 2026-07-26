import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride, RideStatus } from "@/store/useRideStore";
import { Check } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const statuses: RideStatus[] = ["assigned", "accepted", "arrived", "started", "completed"];

const statusLabels: Record<RideStatus, string> = {
  assigned: "Ride Assigned",
  accepted: "Driver Accepted",
  arrived: "Driver Arrived",
  started: "Trip Started",
  completed: "Trip Completed",
  cancelled: "Trip Cancelled"
};

export function RideTimeline({ ride }: { ride: Ride }) {
  const currentIndex = statuses.indexOf(ride.status);
  
  if (ride.status === "cancelled") return null;

  return (
    <Animated.View entering={FadeInDown.delay(600).duration(500).springify()} className="px-6 mb-8 mt-2">
      <Text className="text-white font-bold text-lg mb-4">Trip Timeline</Text>
      <View className="bg-[#111111] rounded-3xl p-6 border border-white/5 shadow-sm">
        {statuses.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const isLast = index === statuses.length - 1;

          return (
            <View key={status} className="flex-row">
              {/* Timeline indicator col */}
              <View className="items-center mr-4 w-6">
                <View className={cn(
                  "w-6 h-6 rounded-full items-center justify-center z-10",
                  isCompleted ? "bg-yellow-500" : isCurrent ? "bg-yellow-500/20 border-2 border-yellow-500" : "bg-zinc-800 border-2 border-zinc-700"
                )}>
                  {isCompleted && <Check size={12} color="#000" strokeWidth={3} />}
                  {isCurrent && <View className="w-2 h-2 rounded-full bg-yellow-500" />}
                </View>
                {!isLast && (
                  <View className={cn(
                    "w-0.5 h-10 -my-1",
                    isCompleted ? "bg-yellow-500" : "bg-zinc-800"
                  )} />
                )}
              </View>
              
              {/* Content col */}
              <View className="pt-0.5 pb-6">
                <Text className={cn(
                  "font-bold text-base",
                  isCompleted ? "text-zinc-300" : isCurrent ? "text-yellow-500" : "text-zinc-600"
                )}>
                  {statusLabels[status]}
                </Text>
                {(isCompleted || isCurrent) && (
                  <Text className="text-zinc-500 text-xs font-medium mt-0.5">
                    10:45 AM
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
