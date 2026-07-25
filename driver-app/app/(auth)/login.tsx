import React from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView } from "@/components/tw";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, Link } from "expo-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Lock } from "lucide-react-native";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { Image } from "@/components/tw/image";

const loginSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      setAuth(data.driver, data.token, data.refreshToken);
      router.replace("/(tabs)");
    },
    onError: (error) => {
      console.error("Login Failed:", error);
      // Real app would show a Toast here
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    // For demo purposes, we can mock success if API isn't ready
    // loginMutation.mutate({ phone: data.phone, password: data.password });
    
    // MOCK LOGIN FOR DEVELOPMENT
    setAuth(
      { id: "1", firstName: "John", lastName: "Doe", phone: data.phone, rating: 5, totalRides: 10, status: "active", createdAt: new Date().toISOString() },
      "mock-token",
      "mock-refresh-token"
    );
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-card rounded-3xl items-center justify-center mb-6 border border-border">
            <Text className="text-4xl font-bold text-primary">G</Text>
          </View>
          <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
          <Text className="text-base text-muted text-center">
            Log in to manage your rides and earnings with GoLongDrive
          </Text>
        </View>

        <View className="gap-5">
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                isPassword
                leftIcon={<Lock size={20} color="#9ca3af" />}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.password?.message}
              />
            )}
          />

          <View className="flex-row items-center justify-between mt-2">
            <Controller
              control={control}
              name="rememberMe"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  checked={!!value}
                  onCheckedChange={onChange}
                  label="Remember Me"
                />
              )}
            />
            
            <Link href="/(auth)/forgot-password" asChild>
              <Text className="text-primary font-semibold">Forgot Password?</Text>
            </Link>
          </View>

          <Button
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
            isLoading={loginMutation.isPending}
          >
            Log In
          </Button>
          
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-muted">New driver?</Text>
            <Text className="text-primary font-semibold">Apply now</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
