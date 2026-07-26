import React, { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { OTPInput } from "@/components/ui/otp-input";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { PageContainer, ScreenHeader } from "@/components/ui/layout";
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
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <ScreenHeader 
          title="Verify OTP" 
          subtitle={`We've sent a 6-digit code to ${phone ? `+91 ${phone.substring(0, 5)}...` : "your phone number"}.`}
        />

        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.formContainer}>
          <OTPInput
            length={6}
            value={otp}
            onChange={setOtp}
            error={error}
          />

          <Button
            style={styles.verifyButton}
            onPress={onSubmit}
            isLoading={verifyOtpMutation.isPending}
          >
            Verify Code
          </Button>

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.resendAction}>Resend</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PageContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  formContainer: {
    width: '100%',
    gap: 32, // gap-8
    marginTop: 16, // mt-4
  },
  verifyButton: {
    width: '100%',
    marginTop: 8, // mt-2
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8, // gap-2
    marginTop: 16, // mt-4
  },
  resendText: {
    color: '#A1A1AA', // text-zinc-400
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
  },
  resendAction: {
    color: '#EAB308', // text-yellow-500
    fontWeight: 'bold',
    fontSize: 16, // text-base
  },
});
