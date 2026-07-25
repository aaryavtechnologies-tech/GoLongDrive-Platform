import React, { useState } from "react";
import { TextInput, View, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

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

    return (
      <View className="w-full gap-2">
        {label && (
          <Text className="text-sm font-medium text-muted">
            {label}
          </Text>
        )}
        <View
          className={cn(
            "flex-row items-center h-14 rounded-2xl border px-4 bg-card",
            isFocused ? "border-primary" : "border-border",
            error && "border-danger",
            className
          )}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className="flex-1 h-full text-white text-base font-sans"
            placeholderTextColor="#6b7280"
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            secureTextEntry={isPassword && !isPasswordVisible}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="p-2"
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color="#9ca3af" />
              ) : (
                <Eye size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text className="text-sm text-danger mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";
