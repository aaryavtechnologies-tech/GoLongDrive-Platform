import React from "react";
import { ActivityIndicator, Pressable, Text, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  textStyle?: object;
  disableHaptics?: boolean;
  style?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  style,
  variant = "primary",
  size = "default",
  isLoading = false,
  textStyle,
  disableHaptics = false,
  children,
  leftIcon,
  rightIcon,
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

  const getContainerStyle = () => {
    const stylesArray: any[] = [styles.base];
    
    if (variant === "primary") stylesArray.push(styles.primary);
    if (variant === "secondary") stylesArray.push(styles.secondary);
    if (variant === "outline") stylesArray.push(styles.outline);
    if (variant === "ghost") stylesArray.push(styles.ghost);

    if (size === "default") stylesArray.push(styles.sizeDefault);
    if (size === "sm") stylesArray.push(styles.sizeSm);
    if (size === "lg") stylesArray.push(styles.sizeLg);
    if (size === "icon") stylesArray.push(styles.sizeIcon);

    if (!isInteractive) stylesArray.push(styles.disabled);
    if (style) stylesArray.push(style);

    return stylesArray;
  };

  const getTextStyle = () => {
    const stylesArray: any[] = [styles.textBase];
    
    if (variant === "primary") stylesArray.push(styles.textPrimary);
    else stylesArray.push(styles.textWhite);

    if (size === "sm") stylesArray.push(styles.textSm);
    
    if (textStyle) stylesArray.push(textStyle);

    return stylesArray;
  };

  return (
    <Animated.View style={[animatedStyle, !isInteractive && styles.disabled]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={!isInteractive}
        style={getContainerStyle()}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={variant === "primary" ? "#000" : "#EAB308"} />
        ) : (
          <>
            {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
            {typeof children === "string" ? (
              <Text style={getTextStyle()}>
                {children}
              </Text>
            ) : (
              children
            )}
            {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: '#EAB308', // Primary yellow
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#1A1A1A', // Elevated card
    borderWidth: 1,
    borderColor: '#262626', // Border
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#262626',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  sizeDefault: {
    height: 56,
    paddingHorizontal: 24,
  },
  sizeSm: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sizeLg: {
    height: 64,
    paddingHorizontal: 32,
  },
  sizeIcon: {
    height: 56,
    width: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  textBase: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.5, // tracking-tight
  },
  textPrimary: {
    color: '#000000',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textSm: {
    fontSize: 16,
  },
});
