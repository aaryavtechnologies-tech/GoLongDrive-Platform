import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Camera as CameraIcon, RefreshCcw } from 'lucide-react-native';
import { Button } from '@/components/ui/button';

interface CameraCaptureModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
  type?: 'front' | 'back';
  title?: string;
  isCircularPreview?: boolean;
}

export function CameraCaptureModal({
  visible,
  onClose,
  onCapture,
  type = 'front',
  title = "Capture Photo",
  isCircularPreview = false,
}: CameraCaptureModalProps) {
  const [facing, setFacing] = useState<CameraType>(type);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!visible) return null;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <Button onPress={requestPermission} style={styles.permissionButton}>
            Grant Permission
          </Button>
          <Button onPress={onClose} variant="outline" style={styles.permissionButton}>
            Cancel
          </Button>
        </SafeAreaView>
      </Modal>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        if (photo) {
          onCapture(photo.uri);
          onClose();
        }
      } catch (error) {
        console.error("Failed to take picture", error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
            <RefreshCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.cameraContainer}>
          <View style={[styles.cameraWrapper, isCircularPreview && styles.circularWrapper]}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
            {isCircularPreview && (
              <View style={styles.circularOverlay}>
                <View style={styles.circleCutout} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]} 
            onPress={takePicture}
            disabled={isCapturing}
          >
            <View style={styles.captureButtonInner}>
              <CameraIcon size={32} color="#000000" />
            </View>
          </TouchableOpacity>
          <Text style={styles.footerText}>
            Ensure your face is clearly visible in the frame
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 24,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    width: '100%',
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flipButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  circularWrapper: {
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  circularOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 4,
    borderColor: '#EAB308', // yellow-500
    borderRadius: 160,
  },
  circleCutout: {
    // This is a simplified way to show a circular cutout if we were doing a full screen overlay.
    // Since we clipped the wrapper itself with borderRadius, we just need a border overlay.
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(234, 179, 8, 0.3)', // yellow-500 with opacity
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EAB308', // yellow-500
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#A1A1AA',
    fontSize: 14,
  },
});
