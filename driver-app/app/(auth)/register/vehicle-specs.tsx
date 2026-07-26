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
import { Calendar, Users, Settings2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const vehicleSpecsSchema = z.object({
  fuelType: z.string().min(2, "Fuel type is required"),
  manufacturingYear: z.string().min(4, "Year is required").max(4),
  seatingCapacity: z.string().min(1, "Seating capacity is required"),
  acAvailable: z.boolean(),
});

type VehicleSpecsFormValues = z.infer<typeof vehicleSpecsSchema>;

const FUEL_TYPES = [
  { label: 'Petrol', value: 'petrol' },
  { label: 'Diesel', value: 'diesel' },
  { label: 'CNG', value: 'cng' },
  { label: 'Electric', value: 'electric' },
];

const BOOLEAN_OPTIONS = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

export default function VehicleSpecsStepScreen() {
  const router = useRouter();
  const { vehicleDetails, updateVehicleDetails, setStep } = useRegistrationStore();

  const { control, handleSubmit, formState: { errors } } = useForm<VehicleSpecsFormValues>({
    resolver: zodResolver(vehicleSpecsSchema),
    defaultValues: {
      fuelType: vehicleDetails.fuelType || '',
      manufacturingYear: vehicleDetails.manufacturingYear || '',
      seatingCapacity: vehicleDetails.seatingCapacity || '',
      acAvailable: vehicleDetails.acAvailable ?? true,
    },
  });

  useEffect(() => {
    setStep('VEHICLE_SPECS');
  }, []);

  const onSubmit = (data: VehicleSpecsFormValues) => {
    updateVehicleDetails(data);
    router.push('/(auth)/register/docs-identity');
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
            <Settings2 size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Vehicle Specifications</Text>
            <Text style={styles.sectionSubtitle}>Help us understand your vehicle's features and capabilities.</Text>
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="fuelType"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="Fuel Type"
                  options={FUEL_TYPES}
                  value={value}
                  onSelect={onChange}
                  error={errors.fuelType?.message}
                  placeholder="Select fuel"
                />
              )}
            />

            <Controller
              control={control}
              name="manufacturingYear"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Manufacturing Year"
                    placeholder="e.g. 2022"
                    keyboardType="number-pad"
                    maxLength={4}
                    leftIcon={<Calendar size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.manufacturingYear?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="seatingCapacity"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputWrapper}>
                  <Input
                    label="Seating Capacity"
                    placeholder="e.g. 4"
                    keyboardType="number-pad"
                    leftIcon={<Users size={20} color="#71717A" />}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.seatingCapacity?.message}
                  />
                </View>
              )}
            />

            <Controller
              control={control}
              name="acAvailable"
              render={({ field: { onChange, value } }) => (
                <SelectField
                  label="AC Available?"
                  options={BOOLEAN_OPTIONS}
                  value={value ? 'true' : 'false'}
                  onSelect={(val) => onChange(val === 'true')}
                  error={errors.acAvailable?.message}
                  placeholder="Select"
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
