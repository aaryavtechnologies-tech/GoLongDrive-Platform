import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TouchableWithoutFeedback,
  ScrollView
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function SelectField({ 
  label, 
  options, 
  value, 
  onSelect, 
  placeholder = "Select an option",
  error 
}: SelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <TouchableOpacity 
        style={[styles.selector, error && styles.selectorError]} 
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectorText, !selectedOption && styles.placeholderText]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDown size={20} color="#A1A1AA" />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{label}</Text>
                </View>
                
                <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                  {options.map((option, index) => {
                    const isSelected = option.value === value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionItem,
                          index === options.length - 1 && styles.lastOptionItem
                        ]}
                        onPress={() => handleSelect(option.value)}
                      >
                        <Text style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && <Check size={20} color="#EAB308" />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7', // zinc-200
    marginBottom: 8,
    marginLeft: 4,
  },
  selector: {
    height: 56,
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  selectorError: {
    borderColor: '#EF4444', // red-500
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#71717A', // zinc-500
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181B', // zinc-900
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 40, // SafeArea
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A', // zinc-800
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionsList: {
    paddingHorizontal: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A', // zinc-800
  },
  lastOptionItem: {
    borderBottomWidth: 0,
  },
  optionText: {
    fontSize: 16,
    color: '#E4E4E7', // zinc-200
  },
  optionTextSelected: {
    color: '#EAB308', // yellow-500
    fontWeight: 'bold',
  },
});
