import React, { useRef, useState } from "react";
import { View, TextInput, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { TextInput as RNTextInput } from "react-native";

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
    // Only allow numbers
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

          return (
            <View
              key={index}
              className={cn(
                "w-12 h-14 items-center justify-center rounded-xl border bg-card",
                isActive ? "border-primary" : "border-border",
                error && "border-danger"
              )}
            >
              <Text className="text-2xl font-bold text-white">{char}</Text>
            </View>
          );
        })}
      </View>

      {/* Hidden input to handle keyboard properly */}
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

      {error && <Text className="text-sm text-danger mt-1">{error}</Text>}
    </View>
  );
}
