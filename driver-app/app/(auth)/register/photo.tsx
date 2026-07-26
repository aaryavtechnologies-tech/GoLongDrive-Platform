import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomActionBar } from '@/components/registration/BottomActionBar';
import { CameraCaptureModal } from '@/components/registration/CameraCaptureModal';
import { useRegistrationStore } from '@/store/useRegistrationStore';
import { Camera, CheckCircle2, UserCircle2, CarFront } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Image } from 'expo-image';

export default function PhotoStepScreen() {
  const router = useRouter();
  const { photos, updatePhotos, setStep } = useRegistrationStore();
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [activePhotoType, setActivePhotoType] = useState<'profilePhoto' | 'selfie' | 'vehicleFront' | null>(null);

  useEffect(() => {
    setStep('PHOTO');
  }, []);

  const handleNext = () => {
    router.push('/(auth)/register/review');
  };

  const handleCapture = (uri: string) => {
    if (activePhotoType) {
      updatePhotos({ [activePhotoType]: uri });
    }
  };

  const openCamera = (type: 'profilePhoto' | 'selfie' | 'vehicleFront') => {
    setActivePhotoType(type);
    setIsCameraVisible(true);
  };

  const isValid = !!photos.profilePhoto && !!photos.selfie && !!photos.vehicleFront;

  const renderPhotoCard = (
    type: 'profilePhoto' | 'selfie' | 'vehicleFront', 
    title: string, 
    subtitle: string,
    Icon: any
  ) => {
    const isUploaded = !!photos[type];
    
    return (
      <View style={styles.photoCard}>
        <View style={styles.photoCardHeader}>
          <View style={styles.photoIconWrapper}>
            <Icon size={24} color="#EAB308" />
          </View>
          <View style={styles.photoCardText}>
            <Text style={styles.photoCardTitle}>{title}</Text>
            <Text style={styles.photoCardSubtitle}>{subtitle}</Text>
          </View>
          {isUploaded && (
            <Animated.View entering={FadeIn}>
              <CheckCircle2 size={24} color="#22C55E" />
            </Animated.View>
          )}
        </View>

        {isUploaded ? (
          <View style={styles.previewContainer}>
            <Image 
              source={{ uri: photos[type] }} 
              style={[
                styles.previewImage,
                type === 'vehicleFront' ? styles.previewImageRect : null
              ]} 
              contentFit="cover"
            />
            <Pressable 
              style={styles.retakeButton}
              onPress={() => openCamera(type)}
            >
              <Camera size={16} color="#FFFFFF" />
              <Text style={styles.retakeText}>Retake Photo</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={styles.captureButton}
            onPress={() => openCamera(type)}
          >
            <Camera size={24} color="#A1A1AA" />
            <Text style={styles.captureText}>Open Camera</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400).springify()}>
          <View style={styles.headerContainer}>
            <Camera size={32} color="#EAB308" />
            <Text style={styles.sectionTitle}>Verification Photos</Text>
            <Text style={styles.sectionSubtitle}>Take clear photos for verification purposes.</Text>
          </View>

          {renderPhotoCard(
            'profilePhoto',
            'Profile Photo',
            'This will be shown to customers',
            UserCircle2
          )}

          {renderPhotoCard(
            'selfie',
            'Live Selfie',
            'For identity verification',
            Camera
          )}

          {renderPhotoCard(
            'vehicleFront',
            'Vehicle Front',
            'Show the number plate clearly',
            CarFront
          )}
        </Animated.View>
      </ScrollView>

      <BottomActionBar 
        onNext={handleNext} 
        isNextDisabled={!isValid} 
      />

      <CameraCaptureModal
        visible={isCameraVisible}
        onClose={() => setIsCameraVisible(false)}
        onCapture={handleCapture}
        type={activePhotoType === 'selfie' ? 'front' : 'back'}
        title={`Take ${activePhotoType === 'profilePhoto' ? 'Profile Photo' : activePhotoType === 'selfie' ? 'Selfie' : 'Vehicle Photo'}`}
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
  photoCard: {
    marginBottom: 32,
    backgroundColor: '#09090B', // Even darker zinc for contrast against pure black
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)', // Super subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  photoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  photoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1C0E', // subtle yellow tint
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  photoCardText: {
    flex: 1,
  },
  photoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  photoCardSubtitle: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  captureButton: {
    width: '100%',
    height: 120,
    backgroundColor: '#18181B', // zinc-900
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#3F3F46', // zinc-700
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
  },
  previewImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#27272A',
    marginBottom: 16,
  },
  previewImageRect: {
    borderRadius: 16,
    width: 200,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A', // zinc-800
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retakeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
