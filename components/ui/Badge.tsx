import React from "react";
import { Text, StyleSheet } from "react-native";

type BadgeProps = {
  label: string;
  variant?: "default" | "secondary" | "success" | "destructive";
  style?: any;
};

export function Badge({ label, variant = "default", style }: BadgeProps) {
  return (
    <Text style={[styles.base, styles[variant], style]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 12,
    fontWeight: "600",
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  default: { backgroundColor: "#DBEAFE", color: "#1E40AF" }, // azul
  secondary: { backgroundColor: "#E5E7EB", color: "#374151" }, // gris
  success: { backgroundColor: "#D1FAE5", color: "#065F46" }, // verde
  destructive: { backgroundColor: "#FECACA", color: "#991B1B" }, // rojo
});