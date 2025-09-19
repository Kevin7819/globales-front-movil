import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";

type AvatarProps = {
  src?: string;
  fallback?: string;
  size?: number;
};

export function Avatar({ src, fallback = "?", size = 32 }: AvatarProps) {
  if (src) {
    return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.fallbackText}>{fallback}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: "#D1D5DB", // gris claro
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});