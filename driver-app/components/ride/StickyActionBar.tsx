import React from "react";
import { View } from "react-native";
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
      className="absolute bottom-0 left-0 right-0 p-6 pt-4 bg-black/80"
      style={{
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Button 
        size="lg" 
        className="w-full shadow-lg"
        variant={isSuccess ? "primary" : "primary"}
        onPress={handleAction}
      >
        {label}
      </Button>
    </Animated.View>
  );
}
