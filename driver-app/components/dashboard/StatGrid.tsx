import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Wallet, Car, CheckCircle2, Star } from "lucide-react-native";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
}

function StatCard({ title, value, icon, delay = 0 }: StatCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).duration(500).springify()} 
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
      </View>
      <Text style={styles.valueText}>{value}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </Animated.View>
  );
}

export function StatGrid() {
  const { todayEarnings, todayTrips, acceptanceRate, rating } = useDashboardStore();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <StatCard 
          title="Today's Earnings" 
          value={`₹${todayEarnings}`} 
          icon={<Wallet size={16} color="#EAB308" />} 
          delay={600} 
        />
        <StatCard 
          title="Today's Trips" 
          value={todayTrips.toString()} 
          icon={<Car size={16} color="#EAB308" />} 
          delay={700} 
        />
      </View>
      <View style={styles.row}>
        <StatCard 
          title="Acceptance" 
          value={`${acceptanceRate}%`} 
          icon={<CheckCircle2 size={16} color="#EAB308" />} 
          delay={800} 
        />
        <StatCard 
          title="Rating" 
          value={rating.toString()} 
          icon={<Star size={16} color="#EAB308" />} 
          delay={900} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 24, // mb-6
  },
  row: {
    flexDirection: 'row',
    gap: 16, // gap-4
    marginBottom: 16, // mb-4 (on first row, but can be managed safely by applying it consistently or selectively. Wait, the original code had mb-4 only on the first row. We'll leave it as is and use inline style if needed, or just gap.)
  },
  card: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 16, // p-4
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12, // mb-3
  },
  iconContainer: {
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16, // rounded-full
    backgroundColor: '#18181B', // zinc-900
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
  },
  valueText: {
    fontSize: 24, // text-2xl
    fontWeight: '800', // font-extrabold
    color: '#FFFFFF',
    marginBottom: 4, // mb-1
    letterSpacing: -0.5, // tracking-tight
  },
  titleText: {
    fontSize: 12, // text-xs
    color: '#A1A1AA', // zinc-400
    fontWeight: '500', // font-medium
  },
});
