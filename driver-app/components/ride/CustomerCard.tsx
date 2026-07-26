import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ride } from "@/store/useRideStore";
import { Phone, MessageSquare, Star } from "lucide-react-native";

export function CustomerCard({ ride }: { ride: Ride }) {
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>Passenger</Text>
      <View style={styles.card}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {ride.customer.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.nameText}>{ride.customer.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text style={styles.ratingText}>{ride.customer.rating}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.messageButton}>
            <MessageSquare size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.phoneButton}>
            <Phone size={18} color="#000000" />
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
    padding: 16, // p-4
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    backgroundColor: '#27272A', // bg-zinc-800
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // mr-3
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
  },
  nameText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16, // text-base
    marginBottom: 2, // mb-0.5
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#A1A1AA', // zinc-400
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    marginLeft: 4, // ml-1
  },
  actions: {
    flexDirection: 'row',
    gap: 8, // gap-2
  },
  messageButton: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: '#18181B', // bg-zinc-900
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
  },
  phoneButton: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 20, // rounded-full
    backgroundColor: '#EAB308', // bg-yellow-500
    alignItems: 'center',
    justifyContent: 'center',
  },
});
