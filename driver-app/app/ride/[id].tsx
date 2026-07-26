import React, { useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { StatusBar } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useRideStore } from "@/store/useRideStore";
import { RideHeader } from "@/components/ride/RideHeader";
import { CustomerCard } from "@/components/ride/CustomerCard";
import { LocationCard } from "@/components/ride/LocationCard";
import { VehicleDetailsCard } from "@/components/ride/VehicleDetailsCard";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function RideDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentRide, loadMockRide } = useRideStore();

  useEffect(() => {
    // For demo: load the mock ride if it matches, else load anyway
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
        <CustomerCard ride={currentRide} />
        <LocationCard type="pickup" ride={currentRide} delay={300} />
        <LocationCard type="destination" ride={currentRide} delay={400} />
        <VehicleDetailsCard ride={currentRide} />
      </ScrollView>
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
    paddingBottom: 64, // pb-16
  },
});
