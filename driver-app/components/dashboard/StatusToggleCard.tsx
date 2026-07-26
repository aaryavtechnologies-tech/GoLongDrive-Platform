import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue, withTiming, interpolateColor } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Power } from "lucide-react-native";
import { useDashboardStore, DriverStatus } from "@/store/useDashboardStore";

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
        ['#262626', '#EAB308'] // border color to yellow
      )
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scaleAnim.value },
        { translateX: toggleAnim.value * 32 }
      ]
    };
  });

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.container}>
      <View style={styles.card}>
        <View>
          <Text style={[styles.titleText, isOnline ? styles.textYellow : styles.textWhite]}>
            {status === 'offline' ? 'Offline' : status === 'online' ? 'You are Online' : 'Busy'}
          </Text>
          <Text style={styles.subtitleText}>
            {isOnline ? "Ready for your next ride" : "Go online to start earning"}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={1} onPress={handleToggle}>
          <Animated.View 
            style={[styles.toggleContainer, animatedToggleStyle]} 
          >
            <Animated.View 
              style={[styles.toggleButton, animatedButtonStyle]} 
            >
              <Power size={20} color={isOnline ? "#EAB308" : "#262626"} />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24, // px-6
    marginBottom: 24, // mb-6
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 24, // rounded-3xl
    padding: 24, // p-6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10, // shadow-lg
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 24, // text-2xl
    fontWeight: '800', // font-extrabold
    marginBottom: 4, // mb-1
  },
  textYellow: {
    color: '#EAB308',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  subtitleText: {
    color: '#A1A1AA', // zinc-400
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
  },
  toggleContainer: {
    width: 80, // w-20
    height: 48, // h-12
    borderRadius: 9999, // rounded-full
    padding: 4, // p-1
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleButton: {
    width: 40, // w-10
    height: 40, // h-10
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // shadow-sm
  },
});
