import React, { useState } from "react";
import { TextInput, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";

export interface InputProps extends React.ComponentProps<typeof TextInput> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  style?: any;
  containerStyle?: any;
}

export const Input = React.forwardRef<any, InputProps>(
  ({ style, containerStyle, label, error, leftIcon, isPassword, ...props }, ref) => {
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
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
          </Text>
        )}
        <Animated.View
          style={[
            styles.inputContainer,
            animatedBorderStyle,
            { borderWidth: 1 }
          ]}
        >
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[styles.input, style]}
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
              style={styles.eyeIcon}
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
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4D4D8', // zinc-300
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56, // h-14
    borderRadius: 16, // rounded-2xl
    paddingHorizontal: 16, // px-4
  },
  leftIconContainer: {
    marginRight: 12, // mr-3
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
    marginRight: -8, // -mr-2
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // danger
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});
