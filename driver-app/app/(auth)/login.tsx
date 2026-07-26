import React from "react";
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from "react-native";
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
import { PageContainer } from "@/components/ui/layout";
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
      style={styles.keyboardView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <PageContainer scroll>
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/images/logo.jpeg")} 
              style={styles.logoImage} 
              contentFit="cover" 
            />
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>
            Log in to manage your rides and earnings with GoLongDrive
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.formContainer}>
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputWrapper}>
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
              </View>
            )}
          />

          <View style={styles.forgotRow}>
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
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Button
            style={styles.loginButton}
            onPress={handleSubmit(onSubmit)}
            isLoading={loginMutation.isPending}
          >
            Log In
          </Button>
          
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New driver?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.applyText}>Apply now</Text>
              </TouchableOpacity>
            </Link>
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
  headerContainer: {
    alignItems: 'center',
    marginTop: 32, // mt-8
    marginBottom: 40, // mb-10
  },
  logoContainer: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 24, // rounded-3xl
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(234, 179, 8, 0.2)', // border-yellow-500/20
    marginBottom: 32, // mb-8
    shadowColor: 'rgba(234, 179, 8, 0.15)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    fontSize: 36, // text-4xl
    fontWeight: '800', // font-extrabold
    color: '#FFFFFF',
    marginBottom: 12, // mb-3
    letterSpacing: -0.5, // tracking-tight
  },
  subtitleText: {
    fontSize: 18, // text-lg
    color: '#A1A1AA', // text-zinc-400
    textAlign: 'center',
    fontWeight: '500', // font-medium
    maxWidth: 280, // max-w-[280px]
    lineHeight: 28, // leading-relaxed
  },
  formContainer: {
    marginTop: 16, // mt-4
  },
  inputWrapper: {
    marginBottom: 24, // gap-6 replacement
  },
  forgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8, // mt-2
    marginBottom: 24, // prepare for the next button
  },
  forgotText: {
    color: '#EAB308', // text-yellow-500
    fontWeight: 'bold',
    fontSize: 16, // text-base
  },
  loginButton: {
    marginTop: 24, // mt-6
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32, // mt-8
    gap: 8, // gap-2
  },
  footerText: {
    color: '#A1A1AA', // text-zinc-400
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
  },
  applyText: {
    color: '#EAB308', // text-yellow-500
    fontWeight: 'bold',
    fontSize: 16, // text-base
  },
});
