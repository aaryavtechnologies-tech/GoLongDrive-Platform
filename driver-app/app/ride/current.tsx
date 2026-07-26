import React, { useEffect } from "react";
import { View, ScrollView } from "react-native";
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
        contentContainerClassName="pb-32"
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
