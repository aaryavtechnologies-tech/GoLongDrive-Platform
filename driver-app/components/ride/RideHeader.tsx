import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";

export function RideHeader({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {ride.status === "assigned" && "New Trip Assigned"}
            {ride.status === "accepted" && "Trip Accepted"}
            {ride.status === "arrived" && "Driver Arrived"}
            {ride.status === "started" && "Trip in Progress"}
            {ride.status === "completed" && "Trip Completed"}
          </Text>
        </View>
        <Text style={styles.bookingNumberText}>{ride.bookingNumber}</Text>
      </View>
      
      <Text style={styles.tripTypeText}>
        {ride.tripType}
      </Text>
      <Text style={styles.pickupTimeText}>
        {ride.pickupTime} Pickup
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    paddingTop: 64, // pt-16
    paddingBottom: 24, // pb-6
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // mb-4
  },
  statusBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // bg-yellow-500/10
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    borderRadius: 9999, // rounded-full
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)', // border-yellow-500/20
  },
  statusText: {
    color: '#EAB308', // text-yellow-500
    fontWeight: 'bold',
    fontSize: 12, // text-xs
    textTransform: 'uppercase',
    letterSpacing: 0.5, // tracking-wider
  },
  bookingNumberText: {
    color: '#71717A', // text-zinc-500
    fontSize: 14, // text-sm
    fontWeight: '600', // font-semibold
  },
  tripTypeText: {
    fontSize: 30, // text-3xl
    fontWeight: '800', // font-extrabold
    color: '#FFFFFF',
    marginBottom: 4, // mb-1
    letterSpacing: -0.5, // tracking-tight
  },
  pickupTimeText: {
    fontSize: 16, // text-base
    color: '#A1A1AA', // text-zinc-400
    fontWeight: '500', // font-medium
  },
});
