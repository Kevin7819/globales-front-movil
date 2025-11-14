import React from "react";
import { View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView intensity={60} tint="light" style={styles.wrap}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  inner: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 18
  }
});
