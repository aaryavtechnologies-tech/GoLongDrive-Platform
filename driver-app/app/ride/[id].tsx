import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
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
      <View className="flex-1 bg-black items-center justify-center">
        <StatusBar barStyle="light-content" />
        <Animated.Text entering={FadeInDown} className="text-white font-bold text-xl">Loading ride...</Animated.Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-16"
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
