import React, { useState } from "react";
import { useWindowDimensions, StatusBar, View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";
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
  const { completeOnboarding } = useAuthStore();
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleNext = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      // Just mark complete and layout will route naturally if user skips or finishes
      await completeOnboarding();
      router.push("/(auth)/login");
    } else {
      await completeOnboarding();
      router.push("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={(e: any) => {
            setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
          }}
        >
          {ONBOARDING_DATA.map((item, index) => {
            return (
              <View key={item.id} style={[{ width }, styles.slideContainer]}>
                <View style={styles.iconContainer}>
                  <View style={[styles.halo1, { transform: [{ scale: 1.1 }] }]} />
                  <View style={[styles.halo2, { transform: [{ scale: 1.25 }] }]} />
                  <item.Icon size={80} color="#EAB308" strokeWidth={1.5} />
                </View>
                <Text style={styles.titleText}>
                  {item.title}
                </Text>
                <Text style={styles.descriptionText}>
                  {item.description}
                </Text>
              </View>
            );
          })}
        </Animated.ScrollView>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.dotsContainer}>
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
                style={[styles.dot, dotStyle]}
              />
            );
          })}
        </View>

        <Button 
          onPress={handleNext} 
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        >
          {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Skip to Login"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32, // px-8
  },
  iconContainer: {
    width: 256, // w-64
    height: 256, // h-64
    backgroundColor: '#18181B', // bg-zinc-900
    borderRadius: 128, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48, // mb-12
    borderWidth: 2,
    borderColor: 'rgba(234, 179, 8, 0.2)', // border-yellow-500/20
    shadowColor: 'rgba(234, 179, 8, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 10,
    position: 'relative',
  },
  halo1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 128, // rounded-full
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.1)',
  },
  halo2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 128, // rounded-full
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.05)',
  },
  titleText: {
    fontSize: 30, // text-3xl
    fontWeight: '800', // font-extrabold
    color: '#FFFFFF',
    marginBottom: 16, // mb-4
    textAlign: 'center',
    letterSpacing: -0.5, // tracking-tight
  },
  descriptionText: {
    fontSize: 16, // text-base
    color: '#A1A1AA', // text-zinc-400
    textAlign: 'center',
    lineHeight: 28, // leading-relaxed
    paddingHorizontal: 16, // px-4
  },
  footerContainer: {
    paddingHorizontal: 32, // px-8
    paddingBottom: 40, // pb-10
    paddingTop: 16, // pt-4
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12, // gap-3
    marginBottom: 40, // mb-10
  },
  dot: {
    height: 8, // h-2
    borderRadius: 4, // rounded-full
    backgroundColor: '#EAB308', // bg-yellow-500
  },
  actionButton: {
    width: '100%',
    backgroundColor: '#EAB308', // bg-yellow-500
    borderRadius: 12, // rounded-xl
    height: 56, // h-14
  },
  actionButtonText: {
    color: '#000000', // text-black
    fontWeight: 'bold',
    fontSize: 18, // text-lg
  },
});
