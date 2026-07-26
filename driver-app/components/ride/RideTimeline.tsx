import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride, RideStatus } from "@/store/useRideStore";
import { Check } from "lucide-react-native";

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
    <Animated.View entering={FadeInDown.delay(600).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>Trip Timeline</Text>
      <View style={styles.card}>
        {statuses.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const isLast = index === statuses.length - 1;

          return (
            <View key={status} style={styles.row}>
              {/* Timeline indicator col */}
              <View style={styles.indicatorCol}>
                <View style={[
                  styles.dotOuter,
                  isCompleted ? styles.dotOuterCompleted : isCurrent ? styles.dotOuterCurrent : styles.dotOuterPending
                ]}>
                  {isCompleted && <Check size={12} color="#000" strokeWidth={3} />}
                  {isCurrent && <View style={styles.dotInnerCurrent} />}
                </View>
                {!isLast && (
                  <View style={[
                    styles.line,
                    isCompleted ? styles.lineCompleted : styles.linePending
                  ]} />
                )}
              </View>
              
              {/* Content col */}
              <View style={styles.contentCol}>
                <Text style={[
                  styles.statusText,
                  isCompleted ? styles.textCompleted : isCurrent ? styles.textCurrent : styles.textPending
                ]}>
                  {statusLabels[status]}
                </Text>
                {(isCompleted || isCurrent) && (
                  <Text style={styles.timeText}>
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 32, // mb-8
    marginTop: 8, // mt-2
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 16, // mb-4
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
  row: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    marginRight: 16, // mr-4
    width: 24, // w-6
  },
  dotOuter: {
    width: 24, // w-6
    height: 24, // h-6
    borderRadius: 12, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dotOuterCompleted: {
    backgroundColor: '#EAB308', // bg-yellow-500
  },
  dotOuterCurrent: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)', // bg-yellow-500/20
    borderWidth: 2,
    borderColor: '#EAB308', // border-yellow-500
  },
  dotOuterPending: {
    backgroundColor: '#27272A', // bg-zinc-800
    borderWidth: 2,
    borderColor: '#3F3F46', // border-zinc-700
  },
  dotInnerCurrent: {
    width: 8, // w-2
    height: 8, // h-2
    borderRadius: 4, // rounded-full
    backgroundColor: '#EAB308', // bg-yellow-500
  },
  line: {
    width: 2, // w-0.5
    height: 40, // h-10
    marginTop: -4, // -my-1 (approximately)
    marginBottom: -4,
  },
  lineCompleted: {
    backgroundColor: '#EAB308', // bg-yellow-500
  },
  linePending: {
    backgroundColor: '#27272A', // bg-zinc-800
  },
  contentCol: {
    paddingTop: 2, // pt-0.5
    paddingBottom: 24, // pb-6
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 16, // text-base
  },
  textCompleted: {
    color: '#D4D4D8', // text-zinc-300
  },
  textCurrent: {
    color: '#EAB308', // text-yellow-500
  },
  textPending: {
    color: '#52525B', // text-zinc-600
  },
  timeText: {
    color: '#71717A', // zinc-500
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
    marginTop: 2, // mt-0.5
  },
});
