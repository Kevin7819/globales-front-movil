import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "default" | "ghost" | "outline" | "orbis";
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
  const sizeStyle =
    size === "sm"
      ? styles.sm
      : size === "lg"
      ? styles.lg
      : styles.defaultSize;

  const textColor =
    variant === "ghost"
      ? "#374151"
      : variant === "outline"
      ? "#2563EB"
      : "#fff";

  const content = (
    <View
      style={[
        styles.base,
        variant !== "orbis" && styles.normalButton,
        variant === "default" && styles.default,
        variant === "ghost" && styles.ghost,
        variant === "outline" && styles.outline,
        sizeStyle,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </View>
  );

  if (variant === "orbis") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#0A3A59", "#19bdba"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            sizeStyle,
            styles.orbis,
            disabled && styles.disabled,
            style,
          ]}
        >
          <Text style={[styles.text, { color: "#fff" }]}>{title}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={{ borderRadius: 10 }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  normalButton: {
    paddingHorizontal: 16,
  },

  default: {
    backgroundColor: "#2563EB",
  },

  ghost: {
    backgroundColor: "transparent",
  },

  outline: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "transparent",
  },

  orbis: {
    shadowColor: "#0A3A59",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },

  defaultSize: { paddingVertical: 12, paddingHorizontal: 18 },
  sm: { paddingVertical: 8, paddingHorizontal: 14 },
  lg: { paddingVertical: 16, paddingHorizontal: 26 },

  text: {
    fontSize: 15,
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.5,
  },
});