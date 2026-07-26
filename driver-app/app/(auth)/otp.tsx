import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { PageContainer, ScreenHeader, AppCard } from "@/components/ui/layout";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const verifyOtpMutation = useMutation({
    mutationFn: AuthService.verifyOtp,
    onSuccess: (data) => {
      router.push({ pathname: "/(auth)/reset-password", params: { token: data.token } });
    },
    onError: (err) => {
      setError("Invalid OTP code. Please try again.");
    },
  });

  const onSubmit = () => {
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    
    // MOCK OTP VERIFY
    router.push({ pathname: "/(auth)/reset-password", params: { token: "mock-reset-token" } });
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <ScreenHeader 
          title="Verify OTP" 
          subtitle={`We've sent a 6-digit code to ${phone ? `+91 ${phone.substring(0, 5)}...` : "your phone number"}.`}
        />

        <Animated.View entering={FadeInUp.duration(600).springify()} className="w-full gap-8 mt-4">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            error={error}
          />

          <Button
            className="w-full mt-2"
            onPress={onSubmit}
            isLoading={verifyOtpMutation.isPending}
          >
            Verify Code
          </Button>

          <View className="flex-row justify-center items-center gap-2 mt-4">
            <Text className="text-zinc-400 text-base font-medium">Didn't receive the code?</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-yellow-500 font-bold text-base">Resend</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PageContainer>
    </KeyboardAvoidingView>
  );
}
