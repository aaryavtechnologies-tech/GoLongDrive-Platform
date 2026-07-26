import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar, MapPin, ChevronRight, Clock } from "lucide-react-native";

export function UpcomingRideCard() {
  const hasUpcoming = true; // Mock

  if (!hasUpcoming) return null;

  return (
    <Animated.View entering={FadeInDown.delay(1100).duration(500).springify()} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Ride</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <View style={styles.iconContainer}>
          <Calendar size={24} color="#EAB308" />
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.timeText}>Tomorrow, 10:00 AM</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color="#71717A" />
            <Text style={styles.locationText} numberOfLines={1}>Bangalore to Ooty</Text>
          </View>
        </View>
        <View style={styles.chevronContainer}>
          <ChevronRight size={20} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 32, // mb-8
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // mb-4
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
  },
  viewAllText: {
    color: '#EAB308', // text-yellow-500
    fontWeight: '600', // font-semibold
    fontSize: 14, // text-sm
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 20, // p-5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
  iconContainer: {
    width: 56, // w-14
    height: 56, // h-14
    backgroundColor: '#18181B', // bg-zinc-900
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16, // mr-4
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  contentContainer: {
    flex: 1,
  },
  timeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16, // text-base
    marginBottom: 4, // mb-1
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#A1A1AA', // zinc-400
    fontSize: 14, // text-sm
    marginLeft: 4, // ml-1
  },
  chevronContainer: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: '#18181B', // bg-zinc-900
    alignItems: 'center',
    justifyContent: 'center',
  },
});
