import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { useRegistrationStore, STEPS } from '@/store/useRegistrationStore';
import { useRouter } from 'expo-router';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

interface BottomActionBarProps {
  onNext?: () => void;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  nextLabel?: string;
}

export function BottomActionBar({ 
  onNext, 
  isNextDisabled = false, 
  isNextLoading = false,
  nextLabel = "Next Step"
}: BottomActionBarProps) {
  const router = useRouter();
  const currentStep = useRegistrationStore((state) => state.currentStep);
  const currentIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;

  const handleBack = () => {
    if (isFirstStep) {
      router.back();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Button
        style={styles.nextButton}
        onPress={onNext}
        disabled={isNextDisabled}
        isLoading={isNextLoading}
        rightIcon={!isLastStep ? <ChevronRight size={20} color="#000000" /> : undefined}
      >
        {isLastStep ? "Submit Application" : nextLabel}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#09090B', // zinc-950
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  nextButton: {
    flex: 1,
    height: 56,
  }
});
