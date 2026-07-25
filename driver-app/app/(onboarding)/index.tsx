import React, { useRef, useState } from "react";
import { View, Text, useWindowDimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Accept Rides Easily",
    description: "Get ride requests nearby and accept them with a single tap to start earning.",
  },
  {
    id: 2,
    title: "Track Your Earnings",
    description: "Monitor your daily, weekly, and monthly earnings directly from the app.",
  },
  {
    id: 3,
    title: "24/7 Driver Support",
    description: "We are here to help you around the clock with our dedicated support team.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Typically scroll to next, but for simplicity we'll just update state or skip to login
      router.push("/(auth)/login");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e) => {
            setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
        >
          {ONBOARDING_DATA.map((item, index) => {
            return (
              <View key={item.id} style={{ width }} className="items-center justify-center px-6">
                <View className="w-64 h-64 bg-card rounded-full items-center justify-center mb-12 border border-border">
                  <Text className="text-4xl font-bold text-primary">Slide {index + 1}</Text>
                </View>
                <Text className="text-3xl font-bold text-white mb-4 text-center">{item.title}</Text>
                <Text className="text-base text-muted text-center leading-relaxed">
                  {item.description}
                </Text>
              </View>
            );
          })}
        </Animated.ScrollView>
      </View>

      <View className="px-6 pb-8 pt-4">
        <View className="flex-row justify-center gap-2 mb-8">
          {ONBOARDING_DATA.map((_, index) => {
            return (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  currentIndex === index ? "w-8 bg-primary" : "w-2 bg-border"
                }`}
              />
            );
          })}
        </View>

        <Button onPress={handleNext}>
          {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </SafeAreaView>
  );
}
