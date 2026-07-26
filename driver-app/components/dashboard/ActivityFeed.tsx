import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CheckCircle2, AlertCircle, Banknote, FileCheck } from "lucide-react-native";

const activities = [
  { id: 1, title: "Trip Completed", time: "2 mins ago", icon: CheckCircle2, type: "success" },
  { id: 2, title: "Payment Received (₹450)", time: "1 hour ago", icon: Banknote, type: "info" },
  { id: 3, title: "Document Approved", time: "3 hours ago", icon: FileCheck, type: "success" },
  { id: 4, title: "Trip Cancelled by User", time: "Yesterday", icon: AlertCircle, type: "error" },
];

export function ActivityFeed() {
  return (
    <Animated.View entering={FadeInDown.delay(1300).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>Recent Activity</Text>
      <View style={styles.cardContainer}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === activities.length - 1;
          
          let iconColor = "#71717A"; // default zinc-500
          if (activity.type === "success") iconColor = "#22C55E";
          if (activity.type === "info") iconColor = "#EAB308";
          if (activity.type === "error") iconColor = "#EF4444";

          return (
            <View key={activity.id}>
              <View style={styles.itemRow}>
                <View style={styles.iconContainer}>
                  <Icon size={18} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.titleText}>{activity.title}</Text>
                  <Text style={styles.timeText}>{activity.time}</Text>
                </View>
              </View>
              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 40, // mb-10
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 16, // mb-4
  },
  cardContainer: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 8, // p-2
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // p-4
  },
  iconContainer: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: '#18181B', // zinc-900
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    fontWeight: '600', // font-semibold
    fontSize: 16, // text-base
    marginBottom: 2, // mb-0.5
  },
  timeText: {
    color: '#71717A', // zinc-500
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  divider: {
    height: 1, // h-[1px]
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
    marginHorizontal: 16, // mx-4
  },
});
