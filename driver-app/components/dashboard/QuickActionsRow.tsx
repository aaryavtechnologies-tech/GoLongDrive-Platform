import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Wallet, FileText, Settings, History, HelpCircle, Bell } from "lucide-react-native";

const actions = [
  { id: 1, label: "Earnings", icon: Wallet },
  { id: 2, label: "History", icon: History },
  { id: 3, label: "Documents", icon: FileText },
  { id: 4, label: "Alerts", icon: Bell },
  { id: 5, label: "Support", icon: HelpCircle },
  { id: 6, label: "Settings", icon: Settings },
];

export function QuickActionsRow() {
  return (
    <Animated.View entering={FadeInDown.delay(1200).duration(500).springify()} className="mb-8">
      <Text className="px-6 text-white font-bold text-lg mb-4">Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-6 gap-4"
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity 
              key={action.id} 
              activeOpacity={0.7}
              className="items-center"
            >
              <View className="w-16 h-16 bg-[#111111] rounded-[20px] items-center justify-center mb-2 border border-white/5 shadow-sm">
                <Icon size={24} color="#EAB308" />
              </View>
              <Text className="text-xs text-zinc-400 font-medium">{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}
