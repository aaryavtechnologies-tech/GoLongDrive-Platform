import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
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
    <Animated.View entering={FadeInDown.delay(1200).duration(500).springify()} style={styles.container}>
      <Text style={styles.title}>Quick Actions</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <TouchableOpacity 
              key={action.id} 
              activeOpacity={0.7}
              style={styles.actionButton}
            >
              <View style={styles.iconContainer}>
                <Icon size={24} color="#EAB308" />
              </View>
              <Text style={styles.label}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32, // mb-8
  },
  title: {
    paddingHorizontal: 24, // px-6
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 16, // mb-4
  },
  scrollContent: {
    paddingHorizontal: 24, // px-6
    gap: 16, // gap-4
  },
  actionButton: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64, // w-16
    height: 64, // h-16
    backgroundColor: '#111111',
    borderRadius: 20, // rounded-[20px]
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // mb-2
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
  label: {
    fontSize: 12, // text-xs
    color: '#A1A1AA', // zinc-400
    fontWeight: '500', // font-medium
  },
});
