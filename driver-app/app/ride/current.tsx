import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { useRideStore } from "@/store/useRideStore";
import { RideHeader } from "@/components/ride/RideHeader";
import { RideStatusCard } from "@/components/ride/RideStatusCard";
import { CustomerCard } from "@/components/ride/CustomerCard";
import { LocationCard } from "@/components/ride/LocationCard";
import { VehicleDetailsCard } from "@/components/ride/VehicleDetailsCard";
import { RideTimeline } from "@/components/ride/RideTimeline";
import { RideSupportCard } from "@/components/ride/RideSupportCard";
import { StickyActionBar } from "@/components/ride/StickyActionBar";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CurrentRideScreen() {
  const { currentRide, loadMockRide } = useRideStore();

  useEffect(() => {
    // Automatically load mock ride when opening this screen for demo purposes
    if (!currentRide) {
      loadMockRide();
    }
  }, [currentRide, loadMockRide]);

  if (!currentRide) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.Text entering={FadeInDown} style={styles.loadingText}>Loading ride...</Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <RideHeader ride={currentRide} />
        <RideStatusCard ride={currentRide} />
        <CustomerCard ride={currentRide} />
        <LocationCard type="pickup" ride={currentRide} delay={300} />
        <LocationCard type="destination" ride={currentRide} delay={400} />
        <VehicleDetailsCard ride={currentRide} />
        <RideTimeline ride={currentRide} />
        <RideSupportCard />
      </ScrollView>

      <StickyActionBar />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20, // text-xl
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 128, // pb-32
  },
});
