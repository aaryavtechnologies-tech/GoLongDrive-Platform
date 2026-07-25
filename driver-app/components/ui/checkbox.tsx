import React from "react";
import { TouchableOpacity } from "react-native";
import { View, Text } from "@/components/tw";
import { Check } from "lucide-react-native";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, label, className }: CheckboxProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onCheckedChange(!checked)}
      className={cn("flex-row items-center gap-3", className)}
    >
      <View
        className={cn(
          "w-6 h-6 rounded border items-center justify-center",
          checked ? "bg-primary border-primary" : "border-border bg-transparent"
        )}
      >
        {checked && <Check size={16} color="#000" strokeWidth={3} />}
      </View>
      {label && <Text className="text-white text-base">{label}</Text>}
    </TouchableOpacity>
  );
}
