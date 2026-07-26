import React, { useState, useRef } from "react";
import { useWindowDimensions, StatusBar, View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import Animated, { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from "react-native-reanimated";
import { MapPin, Wallet, Headset, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

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
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleComplete = async () => {
    await completeOnboarding();
    router.replace("/(auth)/login");
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    } else {
      handleComplete();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <LinearGradient
        colors={['#000000', '#111111']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          {currentIndex < ONBOARDING_DATA.length - 1 && (
            <TouchableOpacity onPress={handleComplete}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentContainer}>
          <Animated.ScrollView
            ref={scrollViewRef as any}
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
                  <View style={styles.iconWrapper}>
                    <LinearGradient
                      colors={['rgba(234, 179, 8, 0.2)', 'rgba(234, 179, 8, 0.05)']}
                      style={styles.iconGradient}
                    >
                      <View style={[styles.halo1, { transform: [{ scale: 1.2 }] }]} />
                      <View style={[styles.halo2, { transform: [{ scale: 1.4 }] }]} />
                      <item.Icon size={72} color="#EAB308" strokeWidth={1.5} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.descriptionText}>{item.description}</Text>
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
            rightIcon={currentIndex < ONBOARDING_DATA.length - 1 ? <ChevronRight size={20} color="#000000" /> : undefined}
          >
            {currentIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  skipText: {
    color: '#A1A1AA',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  slideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 64,
  },
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    position: 'relative',
  },
  halo1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.15)',
  },
  halo2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.05)',
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  descriptionText: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 16,
  },
  footerContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 16,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EAB308',
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
});
