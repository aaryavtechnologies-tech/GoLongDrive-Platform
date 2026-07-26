import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useRegistrationStore, STEPS, RegistrationStep } from '@/store/useRegistrationStore';
import { Check } from 'lucide-react-native';

interface RegistrationHeaderProps {
  title?: string;
  subtitle?: string;
}

export function RegistrationHeader({ title, subtitle }: RegistrationHeaderProps) {
  const currentStep = useRegistrationStore((state) => state.currentStep);
  const currentIndex = STEPS.indexOf(currentStep);
  const totalSteps = STEPS.length;
  
  const progressPercent = ((currentIndex) / (totalSteps - 1)) * 100;
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progressPercent}%`, { damping: 20, stiffness: 90 }),
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, progressStyle]} />
        </View>
        <Text style={styles.stepText}>Step {currentIndex + 1} of {totalSteps}</Text>
      </View>
      
      {/* Steps Indicator Dots */}
      <View style={styles.dotsContainer}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          
          return (
            <View key={step} style={styles.dotWrapper}>
              <View 
                style={[
                  styles.dot, 
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted
                ]}
              >
                {isCompleted ? (
                  <Check size={12} color="#000" strokeWidth={3} />
                ) : (
                  <Text style={[
                    styles.dotText,
                    (isActive || isCompleted) && styles.dotTextActive
                  ]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < totalSteps - 1 && (
                <View style={[
                  styles.dotLine,
                  index < currentIndex && styles.dotLineCompleted
                ]} />
              )}
            </View>
          );
        })}
      </View>

      {(title || subtitle) && (
        <View style={styles.headerTextContainer}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#000000',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: '#18181B', // zinc-900
    borderRadius: 2,
    marginRight: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#EAB308', // yellow-500
    borderRadius: 2,
  },
  stepText: {
    color: '#71717A', // zinc-500
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  dotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#09090B', // zinc-950
    borderWidth: 1.5,
    borderColor: '#27272A', // zinc-800
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dotActive: {
    borderColor: '#EAB308', // yellow-500
    backgroundColor: '#1A1C0E', // subtle yellow tint
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  dotCompleted: {
    backgroundColor: '#EAB308', // yellow-500
    borderColor: '#EAB308', // yellow-500
  },
  dotLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#27272A', // zinc-800
    marginLeft: -2,
    marginRight: -2,
    zIndex: 1,
  },
  dotLineCompleted: {
    backgroundColor: '#EAB308', // yellow-500
  },
  dotText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717A', // zinc-500
  },
  dotTextActive: {
    color: '#EAB308', // yellow-500
  },
  headerTextContainer: {
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#A1A1AA', // zinc-400
    lineHeight: 22,
    fontWeight: '400',
  },
});
