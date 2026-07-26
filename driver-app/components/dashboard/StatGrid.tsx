import React from "react";
import { View, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Wallet, Car, CheckCircle2, Star } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, icon, delay = 0 }: StatCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500).springify()} 
      className="flex-1 bg-[#111111] p-4 rounded-3xl border border-white/5 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-8 h-8 rounded-full bg-zinc-900 items-center justify-center border border-white/5">
          {icon}
        </View>
      </View>
      <Text className="text-2xl font-extrabold text-white mb-1 tracking-tight">{value}</Text>
      <Text className="text-xs text-zinc-400 font-medium">{title}</Text>
    </Animated.View>
  );
}

export function StatGrid() {
  const { todayEarnings, todayTrips, acceptanceRate, rating } = useDashboardStore();

  return (
    <View className="px-6 mb-6">
      <View className="flex-row gap-4 mb-4">
        <StatCard 
          title="Today's Earnings" 
          value={`₹${todayEarnings}`} 
          icon={<Wallet size={16} color="#EAB308" />} 
          delay={600} 
        />
        <StatCard 
          title="Today's Trips" 
          value={todayTrips.toString()} 
          icon={<Car size={16} color="#EAB308" />} 
          delay={700} 
        />
      </View>
      <View className="flex-row gap-4">
        <StatCard 
          title="Acceptance" 
          value={`${acceptanceRate}%`} 
          icon={<CheckCircle2 size={16} color="#EAB308" />} 
          delay={800} 
        />
        <StatCard 
          title="Rating" 
          value={rating.toString()} 
          icon={<Star size={16} color="#EAB308" />} 
          delay={900} 
        />
      </View>
    </View>
  );
}
