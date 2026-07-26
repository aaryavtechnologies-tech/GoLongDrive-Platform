import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { MapPin, MapPinned, Copy, Navigation2 } from "lucide-react-native";

interface LocationCardProps {
  type: "pickup" | "destination";
  ride: Ride;
  delay?: number;
}

export function LocationCard({ type, ride, delay = 300 }: LocationCardProps) {
  const isPickup = type === "pickup";
  const location = isPickup ? ride.pickup : ride.destination;
  const title = isPickup ? "Pickup Location" : "Drop-off Location";
  const iconColor = isPickup ? "#71717A" : "#EAB308";
  
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[
            styles.iconContainer,
            isPickup ? styles.iconPickup : styles.iconDropoff
          ]}>
            {isPickup ? <MapPin size={22} color={iconColor} /> : <MapPinned size={22} color={iconColor} />}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.addressText}>{location.address}</Text>
            {location.landmark && (
              <Text style={styles.landmarkText}>Near {location.landmark}</Text>
            )}
            <Text style={styles.cityText}>
              {location.city}, {location.state} {location.pincode}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.copyButton}>
            <Copy size={14} color="#A1A1AA" />
            <Text style={styles.copyText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navigateButton}>
            <Navigation2 size={14} color="#EAB308" />
            <Text style={styles.navigateText}>Navigate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 16, // mb-4
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
  },
  row: {
    flexDirection: 'row',
    gap: 16, // gap-4
  },
  iconContainer: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  iconPickup: {
    backgroundColor: '#18181B', // bg-zinc-900
  },
  iconDropoff: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // bg-yellow-500/10
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addressText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16, // text-base
    marginBottom: 4, // mb-1
  },
  landmarkText: {
    color: '#A1A1AA', // zinc-400
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    marginBottom: 4, // mb-1
  },
  cityText: {
    color: '#71717A', // zinc-500
    fontSize: 12, // text-xs
    fontWeight: '500', // font-medium
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12, // gap-3
    marginTop: 16, // mt-4
    paddingTop: 16, // pt-4
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // gap-1.5
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    backgroundColor: '#18181B', // bg-zinc-900
    borderRadius: 8, // rounded-lg
  },
  copyText: {
    color: '#D4D4D8', // zinc-300
    fontWeight: '600', // font-semibold
    fontSize: 12, // text-xs
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // gap-1.5
    paddingHorizontal: 12, // px-3
    paddingVertical: 6, // py-1.5
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // bg-yellow-500/10
    borderRadius: 8, // rounded-lg
  },
  navigateText: {
    color: '#EAB308', // text-yellow-500
    fontWeight: 'bold',
    fontSize: 12, // text-xs
  },
});
