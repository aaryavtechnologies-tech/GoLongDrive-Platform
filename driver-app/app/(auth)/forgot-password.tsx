import React from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { PageContainer, ScreenHeader } from "@/components/ui/layout";
import Animated, { FadeInUp } from "react-native-reanimated";

const forgotPasswordSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone: "",
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: AuthService.sendOtp,
    onSuccess: (_, variables) => {
      router.push({ pathname: "/(auth)/otp", params: { phone: variables } });
    },
    onError: (error) => {
      console.error("Failed to send OTP:", error);
    },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    // MOCK OTP SEND
    router.push({ pathname: "/(auth)/otp", params: { phone: data.phone } });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <ScreenHeader 
          title="Reset Password" 
          subtitle="Enter your registered phone number and we'll send you an OTP to reset your password." 
        />

        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.formContainer}>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWrapper}>
                <Input
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={22} color="#71717A" />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                />
              </View>
            )}
          />

          <Button
            style={styles.sendButton}
            onPress={handleSubmit(onSubmit)}
            isLoading={sendOtpMutation.isPending}
          >
            Send OTP
          </Button>
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
    marginTop: 8, // mt-2
  },
  inputWrapper: {
    marginBottom: 24, // gap-6
  },
  sendButton: {
    marginTop: 24, // mt-6
  },
});
