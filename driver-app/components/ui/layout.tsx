import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "@/components/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StatusBar } from "react-native";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function PageContainer({ children, className, scroll = false }: { children: React.ReactNode, className?: string, scroll?: boolean }) {
  return (
    <SafeAreaView className={cn("flex-1 bg-black", className)}>
      <StatusBar barStyle="light-content" />
      {scroll ? (
        <ScrollView className="flex-1" contentContainerClassName="flex-grow p-6">
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1 p-6">
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

export function ScreenHeader({ title, subtitle, showBack = true }: { title: string, subtitle?: string, showBack?: boolean }) {
  const router = useRouter();
  return (
    <View className="mb-10 mt-2">
      {showBack && (
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-12 h-12 rounded-full bg-zinc-900/50 items-center justify-center border border-white/5 mb-6"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <Text className="text-4xl font-extrabold text-white tracking-tight leading-tight">
        {title}
      </Text>
      {subtitle && (
        <Text className="text-lg text-zinc-400 mt-3 font-medium leading-relaxed">
          {subtitle}
        </Text>
      )}
    </View>
  );
}

export function AppCard({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <View className={cn("bg-[#111111] border border-white/5 p-6 rounded-3xl shadow-lg", className)}>
      {children}
    </View>
  );
}
