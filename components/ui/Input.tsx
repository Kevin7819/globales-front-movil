import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

export function Input({ style, ...props }: TextInputProps) {
  return <TextInput style={[styles.input, style]} placeholderTextColor="#9CA3AF" {...props} />;
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#ffffffff",

    // Fondo tipo glass como tu AuthCard
    backgroundColor: "rgba(255, 255, 255, 0.10)",

    // Sombrilla suave
    shadowColor: "#0A3A59",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
