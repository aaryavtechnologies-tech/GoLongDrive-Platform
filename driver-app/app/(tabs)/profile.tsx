import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { useAuthStore } from "@/store/useAuthStore";
import { Image } from "expo-image";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Star, 
  ChevronRight, 
  Car, 
  FileText, 
  CreditCard, 
  Settings, 
  HelpCircle, 
  LogOut,
  ShieldCheck
} from "lucide-react-native";
import { useRouter } from "expo-router";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, isDestructive }: MenuItemProps) {
  return (
    <TouchableOpacity 
      style={styles.menuItem} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, isDestructive && styles.menuIconDestructive]}>
        {icon}
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, isDestructive && styles.textDestructive]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight size={20} color={isDestructive ? "#EF4444" : "#71717A"} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { driver, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        } 
      }
    ]);
  };

  if (!driver) return null;

  const joinDate = new Date(driver.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <LinearGradient
            colors={['#1A1A1A', '#09090B']}
            style={styles.headerCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.profileInfoRow}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={driver.profileImage ? { uri: driver.profileImage } : require("../../assets/images/logo.jpeg")} 
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={14} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.profileTextContainer}>
                <Text style={styles.nameText}>{driver.firstName} {driver.lastName}</Text>
                <Text style={styles.phoneText}>{driver.phone}</Text>
                <View style={styles.ratingBadge}>
                  <Star size={14} color="#000000" fill="#000000" />
                  <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{driver.totalRides}</Text>
                <Text style={styles.statLabel}>Total Rides</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{joinDate}</Text>
                <Text style={styles.statLabel}>Joined</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{driver.status === 'active' ? 'Active' : 'Inactive'}</Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Menu Sections */}
        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuGroup}>
            <MenuItem 
              icon={<Car size={22} color="#EAB308" />} 
              title="Vehicle Information" 
              subtitle="Manage your registered vehicle"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon={<FileText size={22} color="#EAB308" />} 
              title="Documents" 
              subtitle="License, Registration, Insurance"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon={<CreditCard size={22} color="#EAB308" />} 
              title="Payment Methods" 
              subtitle="Bank accounts and payouts"
              onPress={() => {}} 
            />
          </View>

          <Text style={styles.sectionTitle}>General</Text>
          <View style={styles.menuGroup}>
            <MenuItem 
              icon={<Settings size={22} color="#EAB308" />} 
              title="Settings" 
              subtitle="App preferences and notifications"
              onPress={() => {}} 
            />
            <View style={styles.divider} />
            <MenuItem 
              icon={<HelpCircle size={22} color="#EAB308" />} 
              title="Help & Support" 
              subtitle="FAQs and contact support"
              onPress={() => {}} 
            />
          </View>

          <View style={[styles.menuGroup, styles.logoutGroup]}>
            <MenuItem 
              icon={<LogOut size={22} color="#EF4444" />} 
              title="Log Out" 
              isDestructive
              onPress={handleLogout} 
            />
          </View>
        </Animated.View>

        <Text style={styles.versionText}>App Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 64, // To account for safe area
    paddingBottom: 100,
  },
  headerCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#EAB308',
    marginRight: 20,
    position: 'relative',
    backgroundColor: '#18181B',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#22C55E',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#09090B',
  },
  profileTextContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  phoneText: {
    fontSize: 15,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAB308',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000000',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 12,
  },
  menuGroup: {
    backgroundColor: '#111111',
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  logoutGroup: {
    marginTop: 8,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuIconDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  textDestructive: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginLeft: 76, // Align with text
  },
  versionText: {
    textAlign: 'center',
    color: '#52525B', // zinc-600
    fontSize: 13,
    marginTop: 16,
  }
});
