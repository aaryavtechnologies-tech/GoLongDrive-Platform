import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { User, Phone, Mail, Calendar } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const personalSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  dob: z.string().min(1, "Date of birth is required"),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

export default function PersonalStepScreen() {
  const router = useRouter();
  const { personalDetails, updatePersonalDetails, setStep } = useRegistrationStore();

  const { control, handleSubmit, formState: { errors } } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: personalDetails.fullName || '',
      phone: personalDetails.phone || '',
      email: personalDetails.email || '',
      dob: personalDetails.dob || '',
    },
  });

  useEffect(() => {
    setStep('PERSONAL');
  }, []);

  const onSubmit = (data: PersonalFormValues) => {
    updatePersonalDetails(data);
    router.push('/(auth)/register/address');
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
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    leftIcon={<User size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.fullName?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Phone Number"
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                    leftIcon={<Phone size={20} color="#71717A" />}
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
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Email Address"
                    placeholder="Enter email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Mail size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="dob"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                  <Input
                    label="Date of Birth (DD/MM/YYYY)"
                    placeholder="DD/MM/YYYY"
                    leftIcon={<Calendar size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.dob?.message}
                  />
                </View>
              )}
            />
          </View>
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
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // Super subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapper: {
    marginBottom: 16,
  }
});
