import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Navigation, Phone, MapPin, MapPinned } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { useRideStore } from "@/store/useRideStore";

export function CurrentRideCard() {
  const router = useRouter();
  const { currentRide } = useRideStore();
  const hasActiveRide = !!currentRide && currentRide.status !== "completed" && currentRide.status !== "cancelled"; 

  if (!hasActiveRide) {
    return (
      <Animated.View entering={FadeInDown.delay(1000).duration(500).springify()} style={styles.container}>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIconContainer}>
            <Navigation size={24} color="#EAB308" />
          </View>
          <Text style={styles.emptyTitle}>No active ride right now</Text>
          <Text style={styles.emptySubtitle}>You're ready for the next booking.</Text>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(1000).duration(500).springify()} style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.push("/ride/current")}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>Current Ride</Text>
            <Text style={styles.headerValue}>{currentRide.bookingNumber}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{currentRide.status}</Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.routeContainer}>
          <View style={styles.routeRow}>
            <View style={styles.iconPickup}>
              <MapPin size={20} color="#71717A" />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeValue}>{currentRide.pickup.address}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={[styles.routeRow, styles.routeRowLast]}>
            <View style={styles.iconDropoff}>
              <MapPinned size={20} color="#EAB308" />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Drop-off</Text>
              <Text style={styles.routeValue}>{currentRide.destination.address}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.phoneButton}>
            <Phone size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Button 
            style={styles.manageButton}
            onPress={() => router.push("/ride/current")}
          >
            Manage Trip
          </Button>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 24, // mb-6
  },
  emptyCard: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 32, // p-8
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 64, // w-16
    height: 64, // h-16
    backgroundColor: '#18181B', // zinc-900
    borderRadius: 32, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // mb-4
  },
  emptyTitle: {
    fontSize: 20, // text-xl
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8, // mb-2
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14, // text-sm
    color: '#A1A1AA', // zinc-400
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 4, // p-1
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10, // shadow-lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20, // p-5
    paddingBottom: 16, // pb-4
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  headerLabel: {
    fontSize: 12, // text-xs
    color: '#A1A1AA', // zinc-400
    fontWeight: 'bold',
    marginBottom: 4, // mb-1
    textTransform: 'uppercase',
    letterSpacing: 0.5, // tracking-wider
  },
  headerValue: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
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
  routeContainer: {
    padding: 20, // p-5
    position: 'relative',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24, // mb-6
  },
  routeRowLast: {
    marginBottom: 0,
  },
  iconPickup: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: '#18181B', // zinc-900
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
  },
  iconDropoff: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: 'rgba(234, 179, 8, 0.1)', // bg-yellow-500/10
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12, // text-xs
    color: '#71717A', // zinc-500
    fontWeight: '500', // font-medium
    marginBottom: 2, // mb-0.5
  },
  routeValue: {
    color: '#FFFFFF',
    fontWeight: '600', // font-semibold
    fontSize: 16, // text-base
  },
  routeLine: {
    position: 'absolute',
    left: 39,
    top: 48,
    width: 2, // w-0.5
    height: 24, // h-6
    backgroundColor: '#27272A', // zinc-800
  },
  actionsContainer: {
    padding: 12, // p-3
    backgroundColor: 'rgba(24, 24, 27, 0.5)', // bg-zinc-900/50
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  phoneButton: {
    width: 56, // w-14
    height: 56, // h-14
    backgroundColor: '#27272A', // bg-zinc-800
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageButton: {
    flex: 1,
    borderRadius: 16, // rounded-2xl
    elevation: 0, // shadow-none
    shadowOpacity: 0,
  },
});
