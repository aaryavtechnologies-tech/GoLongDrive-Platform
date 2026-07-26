import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue, withTiming, interpolateColor } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Power, Car } from "lucide-react-native";
import { useDashboardStore, DriverStatus } from "@/store/useDashboardStore";
import { LinearGradient } from "expo-linear-gradient";

export function StatusToggleCard() {
  const { status, setStatus } = useDashboardStore();
  const isOnline = status === "online" || status === "busy";
  
  // Animation values
  const toggleAnim = useSharedValue(isOnline ? 1 : 0);
  const scaleAnim = useSharedValue(1);

  React.useEffect(() => {
    toggleAnim.value = withSpring(isOnline ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [isOnline]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleAnim.value = withSpring(0.95, { damping: 15, stiffness: 300 }, () => {
      scaleAnim.value = withSpring(1);
    });
    
    setStatus(isOnline ? "offline" : "online");
  };

  const animatedToggleStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        toggleAnim.value,
        [0, 1],
        ['rgba(255,255,255,0.1)', 'rgba(234,179,8,0.2)']
      ),
      borderColor: interpolateColor(
        toggleAnim.value,
        [0, 1],
        ['rgba(255,255,255,0.1)', 'rgba(234,179,8,0.5)']
      )
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnim.value },
        { translateX: toggleAnim.value * 38 }
      ],
      backgroundColor: interpolateColor(
        toggleAnim.value,
        [0, 1],
        ['#FFFFFF', '#EAB308']
      )
    };
  });

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.container}>
      <LinearGradient
        colors={isOnline ? ['#1A1A1A', '#09090B'] : ['#111111', '#000000']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {isOnline && (
          <View style={styles.glowEffect} />
        )}

        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            <LinearGradient
              colors={isOnline ? ['rgba(234,179,8,0.3)', 'transparent'] : ['rgba(255,255,255,0.1)', 'transparent']}
              style={styles.iconGradient}
            >
              <Car size={24} color={isOnline ? "#EAB308" : "#71717A"} />
            </LinearGradient>
          </View>
          <View>
            <Text style={[styles.titleText, isOnline ? styles.textYellow : styles.textWhite]}>
              {status === 'offline' ? 'Offline' : status === 'online' ? 'You are Online' : 'Busy'}
            </Text>
            <Text style={styles.subtitleText}>
              {isOnline ? "Searching for new rides..." : "Go online to start earning"}
            </Text>
          </View>
        </View>

        <TouchableOpacity activeOpacity={1} onPress={handleToggle}>
          <Animated.View 
            style={[styles.toggleContainer, animatedToggleStyle]} 
          >
            <Animated.View 
              style={[styles.toggleButton, animatedButtonStyle]} 
            >
              <Power size={18} color={isOnline ? "#000000" : "#000000"} />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    transform: [{ scale: 2 }],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  textYellow: {
    color: '#EAB308',
    textShadowColor: 'rgba(234, 179, 8, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  textWhite: {
    color: '#FFFFFF',
  },
  subtitleText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '500',
  },
  toggleContainer: {
    width: 86,
    height: 48,
    borderRadius: 24,
    padding: 4,
    justifyContent: 'center',
    borderWidth: 1,
  },
  toggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});
