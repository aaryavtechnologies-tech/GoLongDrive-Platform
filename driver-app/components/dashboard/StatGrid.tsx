import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Wallet, Car, CheckCircle2, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={['#1A1A1A', '#09090B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.05)']}
            style={styles.iconContainer}
          >
            {icon}
          </LinearGradient>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      </LinearGradient>
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
          delay={300} 
        />
        <StatCard 
          title="Today's Trips" 
          value={todayTrips.toString()} 
          icon={<Car size={16} color="#EAB308" />} 
          delay={400} 
        />
      </View>
      <View style={styles.row}>
        <StatCard 
          title="Acceptance" 
          value={`${acceptanceRate}%`} 
          icon={<CheckCircle2 size={16} color="#EAB308" />} 
          delay={500} 
        />
        <StatCard 
          title="Rating" 
          value={rating.toString()} 
          icon={<Star size={16} color="#EAB308" />} 
          delay={600} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  valueText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  titleText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
