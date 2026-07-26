import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { MapPin, Navigation, Home } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const addressSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export default function AddressStepScreen() {
  const router = useRouter();
  const { personalDetails, updatePersonalDetails, setStep } = useRegistrationStore();

  const { control, handleSubmit, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: personalDetails.address || '',
      city: personalDetails.city || '',
      state: personalDetails.state || '',
      pincode: personalDetails.pincode || '',
    },
  });

  useEffect(() => {
    setStep('ADDRESS');
  }, []);

  const onSubmit = (data: AddressFormValues) => {
    updatePersonalDetails(data);
    router.push('/(auth)/register/account');
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
          <View style={styles.headerContainer}>
            <Home size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Home Address</Text>
            <Text style={styles.sectionSubtitle}>Please enter your current residential address.</Text>
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Street Address"
                    placeholder="Enter street address"
                    leftIcon={<MapPin size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.address?.message}
                  />
                </View>
              )}
            />

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 12 }]}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="City"
                      placeholder="City"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.city?.message}
                    />
                  )}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="State"
                      placeholder="State"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.state?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="pincode"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                  <Input
                    label="Pincode"
                    placeholder="Enter pincode"
                    keyboardType="number-pad"
                    leftIcon={<Navigation size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.pincode?.message}
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
  formSection: {
    marginBottom: 24,
    backgroundColor: '#09090B',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  }
});
