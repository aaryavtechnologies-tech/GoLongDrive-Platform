import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, withSpring, useSharedValue, withTiming, interpolateColor } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Power } from "lucide-react-native";
import { useDashboardStore, DriverStatus } from "@/store/useDashboardStore";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

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
    <Animated.View entering={FadeInDown.duration(500).springify()} className="px-6 mb-6">
      <View className="bg-[#111111] rounded-3xl p-6 border border-white/5 shadow-lg flex-row items-center justify-between">
        <View>
          <Text className={cn("text-2xl font-extrabold mb-1", isOnline ? "text-yellow-500" : "text-white")}>
            {status === 'offline' ? 'Offline' : status === 'online' ? 'You are Online' : 'Busy'}
          </Text>
          <Text className="text-zinc-400 text-sm font-medium">
            {isOnline ? "Ready for your next ride" : "Go online to start earning"}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={1} onPress={handleToggle}>
          <Animated.View 
            style={[animatedToggleStyle, { borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }]} 
            className="w-20 h-12 rounded-full p-1 justify-center"
          >
            <Animated.View 
              style={[animatedButtonStyle]} 
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <Power size={20} color={isOnline ? "#EAB308" : "#262626"} />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
