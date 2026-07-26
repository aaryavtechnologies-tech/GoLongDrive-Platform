import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { Lock, ShieldCheck, CheckSquare, Square } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const accountSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AccountFormValues = z.infer<typeof accountSchema>;

export default function AccountStepScreen() {
  const router = useRouter();
  const { accountDetails, updateAccountDetails, setStep } = useRegistrationStore();
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3

  const { control, handleSubmit, watch, formState: { errors } } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      password: accountDetails.password || '',
      confirmPassword: accountDetails.password || '',
      termsAccepted: accountDetails.termsAccepted || false,
    },
  });

  const passwordValue = watch('password');

  useEffect(() => {
    setStep('ACCOUNT');
  }, []);

  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (passwordValue.length >= 8) strength += 1;
    if (/[A-Z]/.test(passwordValue)) strength += 1;
    if (/[0-9]/.test(passwordValue) || /[^A-Za-z0-9]/.test(passwordValue)) strength += 1;
    setPasswordStrength(strength);
  }, [passwordValue]);

  const onSubmit = (data: AccountFormValues) => {
    updateAccountDetails({
      password: data.password,
      termsAccepted: data.termsAccepted
    });
    router.push('/(auth)/register/vehicle-basic');
  };

  const renderStrengthBars = () => {
    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthHeader}>
          <Text style={styles.strengthLabel}>Password Strength</Text>
          <Text style={[
            styles.strengthValue,
            passwordStrength === 0 && { color: '#71717A' },
            passwordStrength === 1 && { color: '#EF4444' },
            passwordStrength === 2 && { color: '#F59E0B' },
            passwordStrength === 3 && { color: '#10B981' },
          ]}>
            {passwordStrength === 0 && "Weak"}
            {passwordStrength === 1 && "Weak"}
            {passwordStrength === 2 && "Good"}
            {passwordStrength === 3 && "Strong"}
          </Text>
        </View>
        <View style={styles.barsContainer}>
          {[1, 2, 3].map((level) => (
            <View 
              key={level} 
              style={[
                styles.bar,
                passwordStrength >= level && level === 1 && { backgroundColor: '#EF4444' },
                passwordStrength >= level && level === 2 && { backgroundColor: '#F59E0B' },
                passwordStrength >= level && level === 3 && { backgroundColor: '#10B981' },
              ]} 
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={styles.formSection}>
            <View style={styles.headerContainer}>
              <ShieldCheck size={32} color="#EAB308" />
              <Text style={styles.sectionTitle}>Secure your account</Text>
              <Text style={styles.sectionSubtitle}>Create a strong password to protect your earnings and details.</Text>
            </View>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Password"
                    placeholder="Enter password"
                    isPassword
                    leftIcon={<Lock size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.password?.message}
                  />
                  {renderStrengthBars()}
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
                    placeholder="Confirm password"
                    isPassword
                    leftIcon={<Lock size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.confirmPassword?.message}
                  />
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="termsAccepted"
            render={({ field: { onChange, value } }) => (
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkboxRow} 
                  onPress={() => onChange(!value)}
                  activeOpacity={0.7}
                >
                  {value ? (
                    <CheckSquare size={24} color="#EAB308" />
                  ) : (
                    <Square size={24} color="#71717A" />
                  )}
                  <Text style={styles.termsText}>
                    I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>.
                  </Text>
                </TouchableOpacity>
                {errors.termsAccepted && (
                  <Text style={styles.errorText}>{errors.termsAccepted.message}</Text>
                )}
              </View>
            )}
          />
        </Animated.View>
      </ScrollView>

      <BottomActionBar onNext={handleSubmit(onSubmit)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#09090B', // Even darker zinc for contrast against pure black
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // Super subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#A1A1AA', // zinc-400
    textAlign: 'center',
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  strengthContainer: {
    marginTop: 12,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#71717A', // zinc-500
  },
  strengthValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  bar: {
    flex: 1,
    height: 4,
    backgroundColor: '#3F3F46', // zinc-700
    borderRadius: 2,
  },
  termsContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#E4E4E7', // zinc-200
    lineHeight: 20,
  },
  linkText: {
    color: '#EAB308', // yellow-500
    fontWeight: 'bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 36,
  }
});
