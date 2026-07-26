import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Check } from "lucide-react-native";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  style?: any;
}

export function Checkbox({ checked, onCheckedChange, label, style }: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onCheckedChange(!checked)}
      style={[styles.container, style]}
    >
      <View style={[styles.box, checked ? styles.boxChecked : styles.boxUnchecked]}>
        {checked && <Check size={16} color="#000" strokeWidth={3} />}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: '#EAB308',
    borderColor: '#EAB308',
  },
  boxUnchecked: {
    backgroundColor: 'transparent',
    borderColor: '#262626',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
