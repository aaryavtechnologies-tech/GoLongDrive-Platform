import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { ScrollView } from "@/components/tw";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, ArrowLeft } from "lucide-react-native";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "@/services/auth.service";

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
      // Pass the phone number to OTP screen
      router.push({ pathname: "/(auth)/otp", params: { phone: variables } });
    },
    onError: (error) => {
      console.error("Failed to send OTP:", error);
    },
  });

  const onSubmit = (data: ForgotPasswordValues) => {
    // MOCK OTP SEND
    router.push({ pathname: "/(auth)/otp", params: { phone: data.phone } });
    // sendOtpMutation.mutate(data.phone);
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
          <Text className="text-3xl font-bold text-white mb-2">Reset Password</Text>
          <Text className="text-base text-muted">
            Enter your registered phone number and we'll send you an OTP to reset your password.
          </Text>
        </View>

        <View className="gap-6">
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                leftIcon={<Phone size={20} color="#9ca3af" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.phone?.message}
              />
            )}
          />

          <Button
            className="mt-4"
            onPress={handleSubmit(onSubmit)}
            isLoading={sendOtpMutation.isPending}
          >
            Send OTP
          </Button>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
