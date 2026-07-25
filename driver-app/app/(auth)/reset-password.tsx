import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { ScrollView } from "@/components/tw";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

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
      // Redirect back to login
      router.replace("/(auth)/login");
    },
    onError: (error) => {
      console.error("Failed to reset password:", error);
    },
  });

  const onSubmit = (data: ResetPasswordValues) => {
    // MOCK RESET
    router.replace("/(auth)/login");
    // resetPasswordMutation.mutate(data.password);
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

      <ScrollView contentContainerClassName="flex-grow px-6 py-6">
        
        <View className="mb-10">
          <Text className="text-3xl font-bold text-white mb-2">Create New Password</Text>
          <Text className="text-base text-muted">
            Your new password must be different from previous used passwords.
          </Text>
        </View>

        <View className="gap-5">
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="New Password"
                placeholder="Enter new password"
                isPassword
                leftIcon={<Lock size={20} color="#9ca3af" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirm Password"
                placeholder="Confirm your new password"
                isPassword
                leftIcon={<Lock size={20} color="#9ca3af" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Button
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
            isLoading={resetPasswordMutation.isPending}
          >
            Reset Password
          </Button>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
