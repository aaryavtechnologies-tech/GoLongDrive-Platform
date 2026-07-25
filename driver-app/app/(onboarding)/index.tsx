import React, { useState } from "react";
import { View, Text, useWindowDimensions, TouchableOpacity, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation, withTiming } from "react-native-reanimated";
import { MapPin, Wallet, Headset } from "lucide-react-native";

const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Accept Rides Easily",
    description: "Get ride requests nearby and accept them with a single tap to start earning immediately.",
    Icon: MapPin,
  },
  {
    id: 2,
    title: "Track Your Earnings",
    description: "Monitor your daily, weekly, and monthly earnings in real-time directly from your dashboard.",
    Icon: Wallet,
  },
  {
    id: 3,
    title: "24/7 Driver Support",
    description: "We are here to help you around the clock with our dedicated support team to keep you moving.",
    Icon: Headset,
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
      // Typically you'd have a ref to flatlist to scroll next, but skipping to login for now if clicked repeatedly
      router.push("/(auth)/login");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
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
              <View key={item.id} style={{ width }} className="items-center justify-center px-8">
                <View className="w-64 h-64 bg-zinc-900 rounded-full items-center justify-center mb-12 shadow-[0_0_40px_rgba(234,179,8,0.15)] border-2 border-yellow-500/20 relative">
                  <View className="absolute inset-0 rounded-full border border-yellow-500/10 scale-110" />
                  <View className="absolute inset-0 rounded-full border border-yellow-500/5 scale-125" />
                  <item.Icon size={80} color="#EAB308" strokeWidth={1.5} />
                </View>
                <Text className="text-3xl font-extrabold text-white mb-4 text-center tracking-tight">
                  {item.title}
                </Text>
                <Text className="text-base text-zinc-400 text-center leading-relaxed px-4">
                  {item.description}
                </Text>
              </View>
            );
          })}
        </Animated.ScrollView>
      </View>

      <View className="px-8 pb-10 pt-4">
        <View className="flex-row justify-center gap-3 mb-10">
          {ONBOARDING_DATA.map((_, index) => {
            const dotStyle = useAnimatedStyle(() => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
              const dotWidth = interpolate(scrollX.value, inputRange, [8, 32, 8], Extrapolation.CLAMP);
              const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolation.CLAMP);
              return { width: dotWidth, opacity };
            });

            return (
              <Animated.View
                key={index}
                className="h-2 rounded-full bg-yellow-500"
                style={dotStyle}
              />
            );
          })}
        </View>

        <Button onPress={handleNext} className="w-full bg-yellow-500 rounded-xl h-14" textClassName="text-black font-bold text-lg">
          {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Skip to Login"}
        </Button>
      </View>
    </SafeAreaView>
  );
}
