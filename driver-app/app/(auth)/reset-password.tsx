import React from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";
import { PageContainer, ScreenHeader } from "@/components/ui/layout";
import Animated, { FadeInUp } from "react-native-reanimated";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: AuthService.resetPassword,
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
    },
  });

  const onSubmit = (data: ResetPasswordValues) => {
    // MOCK RESET
    router.replace("/(auth)/login");
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <ScreenHeader 
          title="Create New Password" 
          subtitle="Your new password must be different from previous used passwords." 
        />

        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.formContainer}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWrapper}>
                <Input
                  label="New Password"
                  placeholder="Enter new password"
                  isPassword
                  leftIcon={<Lock size={22} color="#71717A" />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWrapper}>
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  isPassword
                  leftIcon={<Lock size={22} color="#71717A" />}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              </View>
            )}
          />

          <Button
            style={styles.resetButton}
            onPress={handleSubmit(onSubmit)}
            isLoading={resetPasswordMutation.isPending}
          >
            Reset Password
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
  resetButton: {
    marginTop: 24, // mt-6
  },
});
