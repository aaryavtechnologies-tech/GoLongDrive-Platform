import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { MapPin, MapPinned, Calendar, Clock, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

// Mock Data
const MOCK_RIDES = [
  {
    id: "1",
    status: "upcoming",
    date: "Today",
    time: "02:30 PM",
    pickup: "Mumbai International Airport",
    dropoff: "Taj Mahal Palace, Colaba",
    fare: "₹850",
    distance: "24 km"
  },
  {
    id: "2",
    status: "completed",
    date: "Yesterday",
    time: "10:15 AM",
    pickup: "Bandra West",
    dropoff: "Andheri East",
    fare: "₹420",
    distance: "12 km"
  },
  {
    id: "3",
    status: "completed",
    date: "24 Jul 2026",
    time: "06:45 PM",
    pickup: "Juhu Beach",
    dropoff: "Marine Drive",
    fare: "₹560",
    distance: "18 km"
  },
  {
    id: "4",
    status: "cancelled",
    date: "23 Jul 2026",
    time: "09:00 AM",
    pickup: "Powai",
    dropoff: "BKC",
    fare: "₹0",
    distance: "15 km"
  }
];

type TabType = 'upcoming' | 'completed' | 'cancelled';

export default function RidesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const router = useRouter();

  const filteredRides = MOCK_RIDES.filter(ride => ride.status === activeTab);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22C55E';
      case 'upcoming': return '#EAB308';
      case 'cancelled': return '#EF4444';
      default: return '#71717A';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.headerTitle}>My Rides</Text>
        
        {/* Custom Tabs */}
        <View style={styles.tabContainer}>
          {(['upcoming', 'completed', 'cancelled'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No rides found</Text>
            <Text style={styles.emptyStateSubtitle}>You don't have any {activeTab} rides right now.</Text>
          </View>
        ) : (
          filteredRides.map((ride, index) => (
            <Animated.View 
              key={ride.id} 
              entering={FadeInDown.delay(index * 100).duration(400).springify()}
            >
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push(`/ride/${ride.id}` as any)}
              >
                <LinearGradient
                  colors={['#1A1A1A', '#09090B']}
                  style={styles.rideCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.dateTimeContainer}>
                      <Calendar size={14} color="#A1A1AA" />
                      <Text style={styles.dateText}>{ride.date}</Text>
                      <View style={styles.dotDivider} />
                      <Clock size={14} color="#A1A1AA" />
                      <Text style={styles.timeText}>{ride.time}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ride.status)}20`, borderColor: `${getStatusColor(ride.status)}50` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(ride.status) }]}>
                        {ride.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.routeContainer}>
                    <View style={styles.routeRow}>
                      <View style={styles.iconPickup}>
                        <MapPin size={16} color="#A1A1AA" />
                      </View>
                      <View style={styles.routeTextContainer}>
                        <Text style={styles.routeValue} numberOfLines={1}>{ride.pickup}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.routeLine} />
                    
                    <View style={styles.routeRow}>
                      <View style={styles.iconDropoff}>
                        <MapPinned size={16} color="#000000" />
                      </View>
                      <View style={styles.routeTextContainer}>
                        <Text style={styles.routeValue} numberOfLines={1}>{ride.dropoff}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.footerLabel}>Earnings</Text>
                      <Text style={styles.footerValue}>{ride.fare}</Text>
                    </View>
                    <View style={styles.actionButton}>
                      <Text style={styles.actionText}>Details</Text>
                      <ChevronRight size={16} color="#EAB308" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  rideCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  timeText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  dotDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F46',
    marginHorizontal: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  routeContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPickup: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconDropoff: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeTextContainer: {
    flex: 1,
  },
  routeValue: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  routeLine: {
    position: 'absolute',
    left: 15,
    top: 32,
    width: 2,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerLabel: {
    fontSize: 12,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 12,
  },
  actionText: {
    color: '#EAB308',
    fontWeight: '600',
    fontSize: 13,
  },
});
