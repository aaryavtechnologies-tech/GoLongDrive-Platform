import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { ScrollView } from "@/components/tw";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { ArrowLeft } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

export default function OTPScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const verifyOtpMutation = useMutation({
    mutationFn: AuthService.verifyOtp,
    onSuccess: (data) => {
      // Typically we might go straight to (tabs) or to a reset password screen if we are resetting
      // We will assume they go to reset-password since they came from forgot-password
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
    // verifyOtpMutation.mutate({ phone, otp });
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="px-6 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-card rounded-full border border-border">
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="flex-grow px-6 py-6 items-center">
        
        <View className="mb-10 w-full">
          <Text className="text-3xl font-bold text-white mb-2">Verify OTP</Text>
          <Text className="text-base text-muted">
            We've sent a 6-digit code to {phone ? `+91 ${phone.substring(0, 5)}...` : "your phone number"}.
          </Text>
        </View>

        <View className="w-full gap-8">
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            error={error}
          />

          <Button
            className="w-full"
            onPress={onSubmit}
            isLoading={verifyOtpMutation.isPending}
          >
            Verify
          </Button>

          <View className="flex-row justify-center items-center gap-1 mt-2">
            <Text className="text-muted text-base">Didn't receive the code?</Text>
            <TouchableOpacity>
              <Text className="text-primary font-bold text-base">Resend</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
