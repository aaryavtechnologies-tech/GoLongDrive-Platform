import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { AuthService } from '@/services/auth.service';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { CheckCircle2, User, Car, FileText, Camera } from 'lucide-react-native';

export default function ReviewStepScreen() {
  const router = useRouter();
  const state = useRegistrationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    state.setStep('REVIEW');
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, we would upload images first, get URLs, then submit the full payload.
      // We simulate this process here.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSuccess(true);
      
      // Wait for success animation
      setTimeout(() => {
        state.clearRegistration();
        router.replace('/(auth)/login');
      }, 2500);

    } catch (e) {
      console.error(e);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = (
    title: string, 
    icon: React.ReactNode, 
    onEdit: () => void, 
    children: React.ReactNode
  ) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <View style={styles.fieldRow} key={label}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <Animated.View entering={FadeIn.duration(800)} style={styles.successContent}>
          <View style={styles.successIconWrapper}>
            <CheckCircle2 size={80} color="#EAB308" />
          </View>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successMessage}>
            Your documents are currently under review by our admin team. You will be notified once your account is activated.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={styles.headerContainer}>
            <CheckCircle2 size={32} color="#EAB308" />
            <Text style={styles.headerTitle}>Review & Submit</Text>
            <Text style={styles.headerSubtitle}>Please review all your details carefully before submitting your application.</Text>
          </View>

          {renderSection(
            "Personal Details", 
            <User size={20} color="#EAB308" />, 
            () => router.push('/(auth)/register/index'),
            <>
              {renderField("Full Name", state.personalDetails.fullName)}
              {renderField("Phone", state.personalDetails.phone)}
              {renderField("Email", state.personalDetails.email)}
              {renderField("Date of Birth", state.personalDetails.dob)}
            </>
          )}

          {renderSection(
            "Address Details", 
            <User size={20} color="#EAB308" />, 
            () => router.push('/(auth)/register/address'),
            <>
              {renderField("Address", state.personalDetails.address)}
              {renderField("Location", `${state.personalDetails.city}, ${state.personalDetails.state} ${state.personalDetails.pincode}`)}
            </>
          )}

          {renderSection(
            "Vehicle Details", 
            <Car size={20} color="#EAB308" />, 
            () => router.push('/(auth)/register/vehicle-basic'),
            <>
              {renderField("Make & Model", `${state.vehicleDetails.brand} ${state.vehicleDetails.model}`)}
              {renderField("Registration No", state.vehicleDetails.vehicleNumber)}
              {renderField("Fuel Type", state.vehicleDetails.fuelType)}
            </>
          )}

          {renderSection(
            "Documents Uploaded", 
            <FileText size={20} color="#EAB308" />, 
            () => router.push('/(auth)/register/docs-identity'),
            <>
              <Text style={styles.docsText}>✓ Aadhaar Card (Front & Back)</Text>
              <Text style={styles.docsText}>✓ Driving License (Front & Back)</Text>
              <Text style={styles.docsText}>✓ Vehicle Registration (RC)</Text>
              <Text style={styles.docsText}>✓ Insurance & PUC</Text>
            </>
          )}

          {renderSection(
            "Photos Uploaded", 
            <Camera size={20} color="#EAB308" />, 
            () => router.push('/(auth)/register/photo'),
            <>
              <Text style={styles.docsText}>✓ Profile Photo</Text>
              <Text style={styles.docsText}>✓ Verification Selfie</Text>
              <Text style={styles.docsText}>✓ Vehicle Front Photo</Text>
            </>
          )}

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              By submitting this application, you confirm that all information provided is accurate and you agree to our Terms of Service. Your account will remain pending until documents are verified.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>

      <BottomActionBar 
        onNext={handleSubmit} 
        isNextLoading={isSubmitting} 
      />
    </View>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A1A1AA', // zinc-400
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: '#09090B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#121214',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editButton: {
    color: '#EAB308',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 16,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#A1A1AA',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  docsText: {
    color: '#E4E4E7', // zinc-200
    fontSize: 14,
    paddingVertical: 6,
  },
  disclaimerContainer: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
    marginTop: 16,
  },
  disclaimerText: {
    color: '#FDE047', // yellow-300
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successContent: {
    alignItems: 'center',
    backgroundColor: '#09090B',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)', // yellow glow edge
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 24,
  }
});
