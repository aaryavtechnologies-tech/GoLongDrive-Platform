import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ShieldAlert, HeadphonesIcon } from "lucide-react-native";

export function RideSupportCard() {
  return (
    <Animated.View entering={FadeInDown.delay(700).duration(500).springify()} style={styles.container}>
      <Text style={styles.headerTitle}>Safety & Support</Text>
      <View style={styles.row}>
        <TouchableOpacity activeOpacity={0.8} style={styles.card}>
          <View style={[styles.iconContainer, styles.iconEmergency]}>
            <ShieldAlert size={22} color="#EF4444" />
          </View>
          <Text style={styles.cardText}>Emergency</Text>
        </TouchableOpacity>
        
        <TouchableOpacity activeOpacity={0.8} style={styles.card}>
          <View style={[styles.iconContainer, styles.iconSupport]}>
            <HeadphonesIcon size={22} color="#3B82F6" />
          </View>
          <Text style={styles.cardText}>Support</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 128, // mb-32
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 12, // mb-3
  },
  row: {
    flexDirection: 'row',
    gap: 16, // gap-4
  },
  card: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 20, // p-5
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12, // mb-3
  },
  iconEmergency: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // bg-red-500/10
  },
  iconSupport: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)', // bg-blue-500/10
  },
  cardText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14, // text-sm
  },
});
