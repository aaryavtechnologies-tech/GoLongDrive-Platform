import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { DocumentUploadCard } from '@/components/registration/DocumentUploadCard';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { FileText } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

export default function DocsVehicleStepScreen() {
  const router = useRouter();
  const { documents, updateDocuments, setStep } = useRegistrationStore();

  useEffect(() => {
    setStep('DOCS_VEHICLE');
  }, []);

  const handleNext = () => {
    router.push('/(auth)/register/photo');
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
    !!documents.rcFront && 
    !!documents.rcBack && 
    !!documents.insuranceCertificate && 
    !!documents.pucCertificate;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={styles.headerContainer}>
            <FileText size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Vehicle Documents</Text>
            <Text style={styles.sectionSubtitle}>Please upload clear photos of your vehicle documents.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.groupTitle}>RC Book</Text>
            <DocumentUploadCard
              title="Front Side"
              value={documents.rcFront}
              onChange={() => pickImage('rcFront')}
            />
            <DocumentUploadCard
              title="Back Side"
              value={documents.rcBack}
              onChange={() => pickImage('rcBack')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.groupTitle}>Certificates</Text>
            <DocumentUploadCard
              title="Insurance Certificate"
              value={documents.insuranceCertificate}
              onChange={() => pickImage('insuranceCertificate')}
            />
            <DocumentUploadCard
              title="PUC Certificate"
              value={documents.pucCertificate}
              onChange={() => pickImage('pucCertificate')}
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
