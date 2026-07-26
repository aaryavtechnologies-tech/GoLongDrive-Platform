import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle2, AlertCircle, Banknote, FileCheck } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const activities = [
  { id: 1, title: "Trip Completed", time: "2 mins ago", icon: CheckCircle2, type: "success" },
  { id: 2, title: "Payment Received (₹450)", time: "1 hour ago", icon: Banknote, type: "info" },
  { id: 3, title: "Document Approved", time: "3 hours ago", icon: FileCheck, type: "success" },
  { id: 4, title: "Trip Cancelled by User", time: "Yesterday", icon: AlertCircle, type: "error" },
];

export function ActivityFeed() {
  return (
    <Animated.View entering={FadeInDown.delay(1300).duration(500).springify()} className="px-6 mb-10">
      <Text className="text-white font-bold text-lg mb-4">Recent Activity</Text>
      <View className="bg-[#111111] rounded-3xl p-2 border border-white/5 shadow-sm">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === activities.length - 1;
          
          let iconColor = "#71717A"; // default zinc-500
          if (activity.type === "success") iconColor = "#22C55E";
          if (activity.type === "info") iconColor = "#EAB308";
          if (activity.type === "error") iconColor = "#EF4444";

          return (
            <View key={activity.id}>
              <View className="flex-row items-center p-4">
                <View className="w-10 h-10 rounded-full bg-zinc-900 items-center justify-center mr-4 border border-white/5">
                  <Icon size={18} color={iconColor} />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base mb-0.5">{activity.title}</Text>
                  <Text className="text-zinc-500 text-xs font-medium">{activity.time}</Text>
                </View>
              </View>
              {!isLast && <View className="h-[1px] bg-white/5 mx-4" />}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
