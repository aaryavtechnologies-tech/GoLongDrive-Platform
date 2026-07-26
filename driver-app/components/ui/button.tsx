import React from "react";
import { ActivityIndicator, View as RNView } from "react-native";
import { Pressable, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  textClassName?: string;
  disableHaptics?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  isLoading = false,
  textClassName,
  disableHaptics = false,
  children,
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: ButtonProps) {
  const isInteractive = !isLoading && !disabled;
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (e: any) => {
    if (isInteractive) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      if (variant === 'ghost' || variant === 'outline') {
        opacity.value = withTiming(0.7, { duration: 100 });
      } else {
        opacity.value = withTiming(0.9, { duration: 100 });
      }
      if (!disableHaptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (isInteractive) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 200 });
    }
    onPressOut?.(e);
  };

  return (
    <Animated.View style={animatedStyle} className={isInteractive ? "" : "opacity-50"}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={!isInteractive}
        className={cn(
          "flex-row items-center justify-center rounded-2xl overflow-hidden",
          variant === "primary" && "bg-primary shadow-[0_4px_14px_rgba(234,179,8,0.25)]",
          variant === "secondary" && "bg-card-elevated border border-border",
          variant === "outline" && "border border-border bg-transparent",
          variant === "ghost" && "bg-transparent",
          size === "default" && "h-14 px-6",
          size === "sm" && "h-11 px-4 rounded-xl",
          size === "lg" && "h-16 px-8",
          size === "icon" && "h-14 w-14",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === "primary" ? "#000" : "#EAB308"} />
        ) : (
          typeof children === "string" ? (
            <Text
              className={cn(
                "text-lg font-bold tracking-tight",
                variant === "primary" ? "text-black" : "text-white",
                size === "sm" && "text-base",
                textClassName
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )
        )}
      </Pressable>
    </Animated.View>
  );
}
