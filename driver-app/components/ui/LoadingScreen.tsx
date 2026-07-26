import React, { useEffect } from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  Easing,
  FadeIn
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { Loader2 } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export function LoadingScreen() {
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Background glow effect */}
      <View style={styles.glowContainer}>
        <View style={styles.glowEffect} />
      </View>

      <Animated.View 
        entering={FadeIn.duration(800)}
        style={styles.contentContainer}
      >
        <Animated.View style={animatedLogoStyle}>
          <Image
            source={require("@/assets/images/logo.jpeg")}
            style={styles.logo}
            contentFit="cover"
            transition={500}
          />
        </Animated.View>
        
        <View style={styles.spinnerContainer}>
          <Animated.View style={animatedSpinnerStyle}>
            <Loader2 size={32} color="#EAB308" strokeWidth={2.5} />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.3,
  },
  glowEffect: {
    width: 256, // w-64
    height: 256, // h-64
    backgroundColor: '#EAB308',
    borderRadius: 128, // rounded-full
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 20, // rough blur approximation
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logo: {
    width: 128, // w-32
    height: 128, // h-32
    borderRadius: 24, // rounded-3xl
    borderWidth: 2,
    borderColor: 'rgba(234, 179, 8, 0.2)', // border-yellow-500/20
  },
  spinnerContainer: {
    marginTop: 48, // mt-12
    height: 32, // h-8
    alignItems: 'center',
    justifyContent: 'center',
  },
});
