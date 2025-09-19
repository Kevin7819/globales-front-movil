import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  style?: any;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  variant = "default",
  size = "default",
  style,
  disabled,
}: ButtonProps) {
  const buttonStyles = [
    styles.base,
    variant === "default" && styles.default,
    variant === "ghost" && styles.ghost,
    variant === "outline" && styles.outline,
    size === "sm" && styles.sm,
    size === "lg" && styles.lg,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    variant === "default" && styles.textDefault,
    variant === "ghost" && styles.textGhost,
    variant === "outline" && styles.textOutline,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  default: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  ghost: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  outline: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  sm: { paddingVertical: 6, paddingHorizontal: 12 },
  lg: { paddingVertical: 14, paddingHorizontal: 24 },
  text: {
    fontSize: 14,
    fontWeight: "600",
  },
  textDefault: { color: "#fff" },
  textGhost: { color: "#374151" },
  textOutline: { color: "#2563EB" },
  disabled: { opacity: 0.5 },
});