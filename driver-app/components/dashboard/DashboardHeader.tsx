import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";
import Animated, { FadeInDown } from "react-native-reanimated";

export function DashboardHeader() {
  const driver = useAuthStore((state) => state.driver);

  return (
    <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require("../../assets/images/logo.jpeg")} 
            style={styles.avatar} 
            contentFit="cover" 
          />
        </View>
        <View>
          <Text style={styles.greetingText}>Good Evening,</Text>
          <Text style={styles.nameText}>{driver?.firstName || "Partner"}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.bellButton}>
        <Bell size={22} color="#FFFFFF" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, // px-6
    paddingTop: 64, // pt-16
    paddingBottom: 16, // pb-4
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
  },
  avatarContainer: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)', // border-yellow-500/20
    backgroundColor: '#1A1A1A', // bg-card
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greetingText: {
    color: '#A1A1AA', // text-zinc-400
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 20, // text-xl
    fontWeight: 'bold',
  },
  bellButton: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    backgroundColor: '#1A1A1A', // bg-card
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#262626', // border-border
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12, // top-3
    right: 12, // right-3
    width: 10, // w-2.5
    height: 10, // h-2.5
    backgroundColor: '#EAB308', // bg-yellow-500
    borderRadius: 5, // rounded-full
    borderWidth: 2,
    borderColor: '#1A1A1A', // border-card
  },
});
