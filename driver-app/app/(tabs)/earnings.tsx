import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { IndianRupee, TrendingUp, Calendar, ChevronRight, ArrowUpRight, ArrowDownRight, ArrowRight } from "lucide-react-native";
import { useDashboardStore } from "@/store/useDashboardStore";

const MOCK_TRANSACTIONS = [
  {
    id: "tx1",
    type: "earning",
    title: "Trip to Colaba",
    date: "Today, 02:30 PM",
    amount: "+₹850"
  },
  {
    id: "tx2",
    type: "payout",
    title: "Weekly Bank Payout",
    date: "Yesterday, 11:00 AM",
    amount: "-₹4,250"
  },
  {
    id: "tx3",
    type: "earning",
    title: "Trip to Andheri East",
    date: "Yesterday, 10:15 AM",
    amount: "+₹420"
  },
  {
    id: "tx4",
    type: "earning",
    title: "Bonus: 10 Trips Completed",
    date: "24 Jul 2026",
    amount: "+₹500"
  }
];

export default function EarningsScreen() {
  const { todayEarnings, todayTrips } = useDashboardStore();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).springify()}>
          <LinearGradient
            colors={['#EAB308', '#A16207']}
            style={styles.balanceCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>Available</Text>
              </View>
            </View>
            
            <View style={styles.balanceAmountContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.balanceAmount}>1,270.00</Text>
            </View>
            
            <TouchableOpacity style={styles.withdrawButton} activeOpacity={0.8}>
              <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
              <ArrowRight size={16} color="#000000" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500).springify()} style={styles.statsRow}>
          <LinearGradient
            colors={['#1A1A1A', '#09090B']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <TrendingUp size={20} color="#EAB308" />
            </View>
            <Text style={styles.statValue}>₹{todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#1A1A1A', '#09090B']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <Calendar size={20} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{todayTrips}</Text>
            <Text style={styles.statLabel}>Trips Today</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(500).springify()}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsContainer}>
            {MOCK_TRANSACTIONS.map((tx, index) => (
              <View key={tx.id}>
                <View style={styles.transactionRow}>
                  <View style={styles.transactionIconContainer}>
                    {tx.type === 'earning' ? (
                      <ArrowDownRight size={20} color="#22C55E" />
                    ) : (
                      <ArrowUpRight size={20} color="#EF4444" />
                    )}
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionTitle}>{tx.title}</Text>
                    <Text style={styles.transactionDate}>{tx.date}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.transactionAmount, 
                      { color: tx.type === 'earning' ? '#22C55E' : '#FFFFFF' }
                    ]}
                  >
                    {tx.amount}
                  </Text>
                </View>
                {index < MOCK_TRANSACTIONS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  balanceAmountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 4,
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -1,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  withdrawButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  seeAllText: {
    fontSize: 14,
    color: '#EAB308',
    fontWeight: '600',
  },
  transactionsContainer: {
    backgroundColor: '#111111',
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
  }
});
