import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { CarFront } from "lucide-react-native";

export function VehicleDetailsCard({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.delay(500).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>Vehicle details</Text>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <CarFront size={24} color="#71717A" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.plateText}>{ride.vehicle.number}</Text>
          <Text style={styles.detailsText}>
            {ride.vehicle.color} {ride.vehicle.brand} {ride.vehicle.model}
          </Text>
        </View>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{ride.vehicle.type}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 24, // mb-6
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 12, // mb-3
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 20, // p-5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56, // w-14
    height: 56, // h-14
    borderRadius: 16, // rounded-2xl
    backgroundColor: '#18181B', // bg-zinc-900
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
  },
  textContainer: {
    flex: 1,
  },
  plateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 2, // mb-0.5
  },
  detailsText: {
    color: '#A1A1AA', // zinc-400
    fontWeight: '500', // font-medium
    fontSize: 14, // text-sm
  },
  typeBadge: {
    backgroundColor: '#27272A', // bg-zinc-800
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    borderRadius: 8, // rounded-lg
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
  },
  typeText: {
    color: '#D4D4D8', // zinc-300
    fontWeight: 'bold',
    fontSize: 12, // text-xs
    textTransform: 'uppercase',
    letterSpacing: 0.5, // tracking-wider
  },
});
