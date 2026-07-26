import React, { useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { Input } from '@/components/ui/input';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { SelectField } from '@/components/registration/SelectField';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { Car, Hash } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const vehicleBasicSchema = z.object({
  brand: z.string().min(2, "Brand is required"),
  model: z.string().min(2, "Model is required"),
  vehicleNumber: z.string().min(4, "Vehicle number is required"),
  vehicleType: z.string().min(2, "Vehicle type is required"),
});

type VehicleBasicFormValues = z.infer<typeof vehicleBasicSchema>;

const VEHICLE_TYPES = [
  { label: 'Hatchback', value: 'hatchback' },
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'MUV', value: 'muv' },
  { label: 'Luxury', value: 'luxury' },
];

export default function VehicleBasicStepScreen() {
  const router = useRouter();
  const { vehicleDetails, updateVehicleDetails, setStep } = useRegistrationStore();

  const { control, handleSubmit, formState: { errors } } = useForm<VehicleBasicFormValues>({
    resolver: zodResolver(vehicleBasicSchema),
    defaultValues: {
      brand: vehicleDetails.brand || '',
      model: vehicleDetails.model || '',
      vehicleNumber: vehicleDetails.vehicleNumber || '',
      vehicleType: vehicleDetails.vehicleType || '',
    },
  });

  useEffect(() => {
    setStep('VEHICLE_BASIC');
  }, []);

  const onSubmit = (data: VehicleBasicFormValues) => {
    updateVehicleDetails(data);
    router.push('/(auth)/register/vehicle-specs');
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
            <Car size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <Text style={styles.sectionSubtitle}>Enter the basic details of the vehicle you will be driving.</Text>
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="brand"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Vehicle Brand"
                    placeholder="e.g. Maruti Suzuki, Hyundai"
                    leftIcon={<Car size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.brand?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="model"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Vehicle Model"
                    placeholder="e.g. Swift, Creta"
                    leftIcon={<Car size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.model?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="vehicleNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Vehicle Registration Number"
                    placeholder="e.g. MH 01 AB 1234"
                    leftIcon={<Hash size={20} color="#71717A" />}
                    autoCapitalize="characters"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.vehicleNumber?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="vehicleType"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Vehicle Type"
                  options={VEHICLE_TYPES}
                  value={value}
                  onSelect={onChange}
                  error={errors.vehicleType?.message}
                  placeholder="Select type"
                />
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
  }
});
