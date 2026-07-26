import React from "react";
import { View, StyleSheet } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { RideStatus, useRideStore } from "@/store/useRideStore";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";

export function StickyActionBar() {
  const { currentRide, setRideStatus, clearRide } = useRideStore();
  const router = useRouter();

  if (!currentRide || currentRide.status === "cancelled") return null;

  const handleAction = () => {
    switch (currentRide.status) {
      case "assigned":
        setRideStatus("accepted");
        break;
      case "accepted":
        setRideStatus("arrived");
        break;
      case "arrived":
        setRideStatus("started");
        break;
      case "started":
        setRideStatus("completed");
        break;
      case "completed":
        clearRide();
        router.back();
        break;
    }
  };

  let label = "";
  let isDestructive = false;
  let isSuccess = false;

  switch (currentRide.status) {
    case "assigned":
      label = "Accept Ride";
      break;
    case "accepted":
      label = "Mark Arrived";
      break;
    case "arrived":
      label = "Start Trip";
      break;
    case "started":
      label = "Complete Trip";
      isSuccess = true;
      break;
    case "completed":
      label = "Back to Home";
      break;
  }

  return (
    <Animated.View 
      entering={FadeInUp.delay(800).duration(400).springify()}
      style={styles.container}
    >
      <Button 
        size="lg" 
        style={styles.button}
        variant={isSuccess ? "primary" : "primary"}
        onPress={handleAction}
      >
        {label}
      </Button>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24, // px-6
    paddingBottom: 24, // pb-6 (adjusted for standard screen padding at bottom)
    paddingTop: 16, // pt-4
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // bg-black/80
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  button: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10, // shadow-lg
  },
});
