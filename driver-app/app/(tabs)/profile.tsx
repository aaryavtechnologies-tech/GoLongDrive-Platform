import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen (Phase 2)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // bg-background (assuming black)
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24, // text-2xl
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
