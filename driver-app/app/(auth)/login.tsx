import React from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
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
import { Image } from "expo-image";
import { PageContainer, ScreenHeader, AppCard } from "@/components/ui/layout";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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
    },
  });

  const onSubmit = (data: LoginFormValues) => {
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
      className="flex-1 bg-black"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <Animated.View entering={FadeInDown.duration(600).springify()} className="items-center mt-8 mb-10">
          <View className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-yellow-500/20 mb-8 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
            <Image 
              source={require("../../assets/images/logo.jpeg")} 
              className="w-full h-full" 
              contentFit="cover" 
            />
          </View>
          <Text className="text-4xl font-extrabold text-white mb-3 tracking-tight">Welcome Back</Text>
          <Text className="text-lg text-zinc-400 text-center font-medium max-w-[280px] leading-relaxed">
            Log in to manage your rides and earnings with GoLongDrive
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).springify()} className="gap-6 mt-4">
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
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
                leftIcon={<Lock size={22} color="#71717A" />}
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
              <Text className="text-yellow-500 font-bold text-base">Forgot Password?</Text>
            </Link>
          </View>

          <Button
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
            isLoading={loginMutation.isPending}
          >
            Log In
          </Button>
          
          <View className="flex-row items-center justify-center mt-8 gap-2">
            <Text className="text-zinc-400 text-base font-medium">New driver?</Text>
            <Text className="text-yellow-500 font-bold text-base">Apply now</Text>
          </View>
        </Animated.View>

      </PageContainer>
    </KeyboardAvoidingView>
  );
}
