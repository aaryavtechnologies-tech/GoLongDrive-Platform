import React from "react";
import { ActivityIndicator } from "react-native";
import { Pressable, Text } from "@/components/tw";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ComponentProps<typeof Pressable> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
  textClassName?: string;
}

export function Button({
  className,
  variant = "primary",
  size = "default",
  isLoading = false,
  textClassName,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isInteractive = !isLoading && !disabled;

  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center rounded-2xl",
        variant === "primary" && "bg-primary active:bg-primary/90",
        variant === "secondary" && "bg-card active:bg-card/80",
        variant === "outline" && "border border-border bg-transparent active:bg-card",
        variant === "ghost" && "bg-transparent active:bg-card",
        size === "default" && "h-14 px-6",
        size === "sm" && "h-10 px-4",
        size === "lg" && "h-16 px-8",
        size === "icon" && "h-14 w-14",
        (!isInteractive) && "opacity-50",
        className
      )}
      disabled={!isInteractive}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "primary" ? "#000" : "#fff"} />
      ) : (
        typeof children === "string" ? (
          <Text
            className={cn(
              "text-lg font-semibold",
              variant === "primary" ? "text-black" : "text-white",
              textClassName
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </Pressable>
  );
}
