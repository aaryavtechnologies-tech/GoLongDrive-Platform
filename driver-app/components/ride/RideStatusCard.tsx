import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { MapPin, Navigation, Clock } from "lucide-react-native";

export function RideStatusCard({ ride }: { ride: Ride }) {
  
  let icon = <Navigation size={24} color="#EAB308" />;
  let title = "Navigate to Pickup";
  let subtitle = "12 mins away • 4.5 km";

  if (ride.status === "arrived") {
    icon = <Clock size={24} color="#EAB308" />;
    title = "Waiting for customer";
    subtitle = "Wait time: 02:45 mins";
  } else if (ride.status === "started") {
    icon = <MapPin size={24} color="#22C55E" />;
    title = "Navigating to Drop-off";
    subtitle = "45 mins away • 22 km";
  } else if (ride.status === "completed") {
    icon = <MapPin size={24} color="#71717A" />;
    title = "Trip Completed";
    subtitle = "You have reached the destination";
  }

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()} style={styles.container}>
      <View style={styles.card}>
        <View style={[
          styles.iconContainer,
          ride.status === "completed" ? styles.iconCompleted : styles.iconActive
        ]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.subtitleText}>{subtitle}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginTop: 24, // mt-6
    marginBottom: 24, // mb-6
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10, // shadow-lg
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56, // w-14
    height: 56, // h-14
    borderRadius: 28, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
  },
  iconActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // bg-yellow-500/10
  },
  iconCompleted: {
    backgroundColor: '#18181B', // bg-zinc-900
  },
  textContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4, // mb-1
  },
  subtitleText: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#A1A1AA', // zinc-400
  },
});
