import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

export function PageContainer({ children, scroll = false, style, contentContainerStyle }: { children: React.ReactNode, scroll?: boolean, style?: any, contentContainerStyle?: any }) {
  return (
    <SafeAreaView style={[styles.pageContainer, style]}>
      <StatusBar barStyle="light-content" />
      {scroll ? (
        <ScrollView style={styles.flex1} contentContainerStyle={[styles.scrollContent, contentContainerStyle]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle, showBack = true }: { title: string, subtitle?: string, showBack?: boolean }) {
  const router = useRouter();
  return (
    <View style={styles.headerContainer}>
      {showBack && (
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <Text style={styles.titleText}>
        {title}
      </Text>
      {subtitle && (
        <Text style={styles.subtitleText}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export function AppCard({ children, style }: { children: React.ReactNode, style?: any }) {
  return (
    <View style={[styles.appCard, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24, // p-6
  },
  staticContent: {
    flex: 1,
    padding: 24, // p-6
  },
  headerContainer: {
    marginBottom: 40, // mb-10
    marginTop: 8, // mt-2
  },
  backButton: {
    width: 48, // w-12
    height: 48, // h-12
    borderRadius: 24, // rounded-full
    backgroundColor: 'rgba(24, 24, 27, 0.5)', // bg-zinc-900/50
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    marginBottom: 24, // mb-6
  },
  titleText: {
    fontSize: 36, // text-4xl
    fontWeight: '800', // font-extrabold
    color: '#FFFFFF',
    letterSpacing: -1, // tracking-tight
    lineHeight: 44, // leading-tight
  },
  subtitleText: {
    fontSize: 18, // text-lg
    color: '#A1A1AA', // zinc-400
    marginTop: 12, // mt-3
    fontWeight: '500', // font-medium
    lineHeight: 28, // leading-relaxed
  },
  appCard: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)', // border-white/5
    padding: 24, // p-6
    borderRadius: 24, // rounded-3xl
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});
