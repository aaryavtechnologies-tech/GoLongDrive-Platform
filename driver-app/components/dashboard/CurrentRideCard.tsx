import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Navigation, Phone, MapPin, MapPinned, Car, Zap } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { useRideStore } from "@/store/useRideStore";
import { LinearGradient } from "expo-linear-gradient";

export function CurrentRideCard() {
  const router = useRouter();
  const { currentRide } = useRideStore();
  const hasActiveRide = !!currentRide && currentRide.status !== "completed" && currentRide.status !== "cancelled"; 

  if (!hasActiveRide) {
    return (
      <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.container}>
        <LinearGradient
          colors={['#18181B', '#09090B']}
          style={styles.emptyCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.emptyIconWrapper}>
            <LinearGradient
              colors={['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.05)']}
              style={styles.emptyIconContainer}
            >
              <Zap size={28} color="#EAB308" />
            </LinearGradient>
          </View>
          <Text style={styles.emptyTitle}>Ready for Requests</Text>
          <Text style={styles.emptySubtitle}>Stay online to receive new ride bookings.</Text>
        </LinearGradient>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => router.push("/ride/current")}
      >
        <LinearGradient
          colors={['#1A1A1A', '#09090B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.activeIndicator}>
                <View style={styles.activeDot} />
              </View>
              <View>
                <Text style={styles.headerLabel}>ACTIVE TRIP</Text>
                <Text style={styles.headerValue}>{currentRide.bookingNumber}</Text>
              </View>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{currentRide.status}</Text>
            </View>
          </View>

          {/* Route Info */}
          <View style={styles.routeContainer}>
            <View style={styles.routeRow}>
              <View style={styles.iconPickup}>
                <MapPin size={18} color="#A1A1AA" />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Pickup Location</Text>
                <Text style={styles.routeValue} numberOfLines={2}>{currentRide.pickup.address}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={[styles.routeRow, styles.routeRowLast]}>
              <View style={styles.iconDropoff}>
                <MapPinned size={18} color="#000000" />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>Drop-off Location</Text>
                <Text style={styles.routeValue} numberOfLines={2}>{currentRide.destination.address}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.phoneButton}>
              <Phone size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Button 
              style={styles.manageButton}
              onPress={() => router.push("/ride/current")}
              rightIcon={<Navigation size={18} color="#000" />}
            >
              Navigate
            </Button>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  emptyCard: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  emptyIconWrapper: {
    marginBottom: 20,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  headerLabel: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: 'bold',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  statusBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  statusText: {
    color: '#EAB308',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeContainer: {
    padding: 24,
    position: 'relative',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  routeRowLast: {
    marginBottom: 0,
  },
  iconPickup: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconDropoff: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeValue: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  routeLine: {
    position: 'absolute',
    left: 41,
    top: 60,
    width: 2,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  actionsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  phoneButton: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  manageButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
});
