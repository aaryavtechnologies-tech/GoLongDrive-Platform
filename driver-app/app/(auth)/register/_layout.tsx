import React from 'react';
import { Stack as ExpoStack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { RegistrationHeader } from '@/components/registration/RegistrationHeader';

export default function RegisterLayout() {
  return (
    <View style={styles.container}>
      <RegistrationHeader 
        title="Driver Registration" 
        subtitle="Complete the steps to join GoLongDrive" 
      />
      <ExpoStack screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' }
      }}>
        <ExpoStack.Screen name="index" />
        <ExpoStack.Screen name="address" />
        <ExpoStack.Screen name="account" />
        <ExpoStack.Screen name="vehicle-basic" />
        <ExpoStack.Screen name="vehicle-specs" />
        <ExpoStack.Screen name="docs-identity" />
        <ExpoStack.Screen name="docs-vehicle" />
        <ExpoStack.Screen name="photo" />
        <ExpoStack.Screen name="review" />
      </ExpoStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  }
});
