import React from "react";
import { View, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatusToggleCard } from "@/components/dashboard/StatusToggleCard";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { CurrentRideCard } from "@/components/dashboard/CurrentRideCard";
import { UpcomingRideCard } from "@/components/dashboard/UpcomingRideCard";
import { QuickActionsRow } from "@/components/dashboard/QuickActionsRow";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Mock refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#EAB308"
            colors={['#EAB308']} 
          />
        }
      >
        <DashboardHeader />
        <StatusToggleCard />
        <CurrentRideCard />
        <StatGrid />
        <UpcomingRideCard />
        <QuickActionsRow />
        <ActivityFeed />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 96, // pb-24
  },
});
