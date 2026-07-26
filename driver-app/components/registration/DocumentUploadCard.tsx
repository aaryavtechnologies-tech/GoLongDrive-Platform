import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Upload, X, CheckCircle, Camera } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface DocumentUploadCardProps {
  title: string;
  isRequired?: boolean;
  value?: string;
  onChange: (uri: string | undefined) => void;
  error?: string;
}

export function DocumentUploadCard({
  title,
  isRequired = false,
  value,
  onChange,
  error
}: DocumentUploadCardProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        // Simulate upload delay for premium feel
        setTimeout(() => {
          onChange(result.assets[0].uri);
          setIsUploading(false);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {isRequired && <Text style={styles.requiredBadge}>*Required</Text>}
      </View>

      {value ? (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.previewContainer}>
          <Image 
            source={{ uri: value }} 
            style={styles.previewImage} 
            contentFit="cover"
            transition={300}
          />
          <View style={styles.previewOverlay}>
            <View style={styles.successBadge}>
              <CheckCircle size={16} color="#EAB308" />
              <Text style={styles.successText}>Uploaded</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeButton} 
              onPress={handleRemove}
              activeOpacity={0.7}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <TouchableOpacity 
          style={[styles.uploadArea, error && styles.uploadAreaError]} 
          onPress={handlePickImage}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color="#EAB308" />
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Upload size={24} color="#EAB308" />
              </View>
              <Text style={styles.uploadText}>Tap to upload document</Text>
              <Text style={styles.uploadSubtext}>JPEG, PNG up to 5MB</Text>
            </>
          )}
        </TouchableOpacity>
      )}
      
      {error && !value && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  requiredBadge: {
    fontSize: 12,
    color: '#EF4444', // red-500
    fontWeight: '600',
  },
  uploadArea: {
    height: 140,
    backgroundColor: '#09090B',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadAreaError: {
    borderColor: '#EF4444',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7', // zinc-200
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#71717A', // zinc-500
  },
  previewContainer: {
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  successText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },
});
