import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TextInput as RNTextInput } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, interpolateColor } from "react-native-reanimated";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    if (numericValue.length <= length) {
      onChange(numericValue);
    }
  };

  return (
    <View className="w-full items-center gap-2">
      <View
        className="flex-row items-center justify-center gap-3 w-full"
        onStartShouldSetResponder={() => true}
        onResponderRelease={handlePress}
      >
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || "";
          const isCurrentActive = isFocused && value.length === index;
          const isActive = isCurrentActive || (isFocused && index === length - 1 && value.length === length);
          
          const scale = useSharedValue(isActive ? 1.05 : 1);
          const focusAnim = useSharedValue(isActive ? 1 : 0);

          useEffect(() => {
            scale.value = withTiming(isActive ? 1.05 : 1, { duration: 150 });
            focusAnim.value = withTiming(isActive ? 1 : 0, { duration: 150 });
          }, [isActive]);

          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: scale.value }],
              borderColor: interpolateColor(
                focusAnim.value,
                [0, 1],
                [error ? '#EF4444' : '#262626', error ? '#EF4444' : '#EAB308']
              ),
              backgroundColor: interpolateColor(
                focusAnim.value,
                [0, 1],
                ['#111111', '#1A1A1A']
              )
            };
          });

          return (
            <Animated.View
              key={index}
              style={[animatedStyle, { borderWidth: 1 }]}
              className={cn(
                "w-12 h-14 items-center justify-center rounded-xl"
              )}
            >
              <Text className="text-2xl font-bold text-white">{char}</Text>
              {isCurrentActive && (
                <Animated.View 
                  className="absolute bottom-2 w-4 h-0.5 bg-yellow-500 rounded-full"
                />
              )}
            </Animated.View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        className="absolute w-[1px] h-[1px] opacity-0"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        caretHidden={true}
        textContentType="oneTimeCode"
      />

      {error && <Text className="text-sm text-danger mt-1 font-medium">{error}</Text>}
    </View>
  );
}
