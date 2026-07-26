import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { DocumentUploadCard } from '@/components/registration/DocumentUploadCard';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { FileBadge } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

export default function DocsIdentityStepScreen() {
  const router = useRouter();
  const { documents, updateDocuments, setStep } = useRegistrationStore();

  useEffect(() => {
    setStep('DOCS_IDENTITY');
  }, []);

  const handleNext = () => {
    router.push('/(auth)/register/docs-vehicle');
  };

  const pickImage = async (field: keyof typeof documents) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      updateDocuments({ [field]: result.assets[0].uri });
    }
  };

  const isValid = 
    !!documents.aadhaarFront && 
    !!documents.aadhaarBack && 
    !!documents.drivingLicenseFront && 
    !!documents.drivingLicenseBack;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={styles.headerContainer}>
            <FileBadge size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Identity Documents</Text>
            <Text style={styles.sectionSubtitle}>Please upload clear photos of your personal identity documents.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.groupTitle}>Aadhaar Card</Text>
            <DocumentUploadCard
              title="Front Side"
              value={documents.aadhaarFront}
              onChange={() => pickImage('aadhaarFront')}
            />
            <DocumentUploadCard
              title="Back Side"
              value={documents.aadhaarBack}
              onChange={() => pickImage('aadhaarBack')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.groupTitle}>Driving License</Text>
            <DocumentUploadCard
              title="Front Side"
              value={documents.drivingLicenseFront}
              onChange={() => pickImage('drivingLicenseFront')}
            />
            <DocumentUploadCard
              title="Back Side"
              value={documents.drivingLicenseBack}
              onChange={() => pickImage('drivingLicenseBack')}
            />
          </View>
        </Animated.View>
      </ScrollView>

      <BottomActionBar 
        onNext={handleNext} 
        isNextDisabled={!isValid} 
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
  section: {
    marginBottom: 32,
    backgroundColor: '#09090B',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF', 
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  }
});
