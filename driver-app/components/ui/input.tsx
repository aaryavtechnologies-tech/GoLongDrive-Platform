import React, { useState } from "react";
import { TextInput, View, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = React.forwardRef<any, InputProps>(
  ({ className, label, error, leftIcon, isPassword, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const focusAnim = useSharedValue(0);

    const animatedBorderStyle = useAnimatedStyle(() => {
      const borderColor = interpolateColor(
        focusAnim.value,
        [0, 1],
        [error ? '#EF4444' : '#262626', error ? '#EF4444' : '#EAB308']
      );
      
      const backgroundColor = interpolateColor(
        focusAnim.value,
        [0, 1],
        ['#111111', '#1A1A1A']
      );

      return {
        borderColor,
        backgroundColor,
      };
    });

    return (
      <View className="w-full gap-2">
        {label && (
          <Text className="text-sm font-semibold text-zinc-300 ml-1">
            {label}
          </Text>
        )}
        <Animated.View
          style={[animatedBorderStyle, { borderWidth: 1 }]}
          className={cn(
            "flex-row items-center h-14 rounded-2xl px-4",
            className
          )}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 h-full text-white text-base font-sans"
            placeholderTextColor="#71717A"
            onFocus={(e) => {
              setIsFocused(true);
              focusAnim.value = withTiming(1, { duration: 200 });
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              focusAnim.value = withTiming(0, { duration: 200 });
              props.onBlur?.(e);
            }}
            secureTextEntry={isPassword && !isPasswordVisible}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="p-2 -mr-2"
            >
              {isPasswordVisible ? (
                <EyeOff size={22} color={isFocused ? "#EAB308" : "#71717A"} />
              ) : (
                <Eye size={22} color={isFocused ? "#EAB308" : "#71717A"} />
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
        {error && (
          <Text className="text-sm text-danger mt-1 ml-1 font-medium">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
