import React, { useRef, useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";

export interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OTPInput({ length = 6, value, onChange, error }: OTPInputProps) {
  const inputRef = useRef<TextInput>(null);
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
    <View style={styles.container}>
      <View
        style={styles.boxesContainer}
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
              style={[styles.box, animatedStyle, { borderWidth: 1 }]}
            >
              <Text style={styles.charText}>{char}</Text>
              {isCurrentActive && (
                <Animated.View style={styles.cursor} />
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
        style={styles.hiddenInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        caretHidden={true}
        textContentType="oneTimeCode"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  boxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  box: {
    width: 48,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  charText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cursor: {
    position: 'absolute',
    bottom: 8,
    width: 16,
    height: 2,
    backgroundColor: '#EAB308',
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // danger
    marginTop: 4,
    fontWeight: '500',
  },
});
