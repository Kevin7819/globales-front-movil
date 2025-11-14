import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { MotiView } from "moti";

type AuthCardProps = {
  children: ReactNode;
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export function AuthCard({ children, icon, title, subtitle }: AuthCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
      style={{ width: "100%" }}
    >
      <BlurView intensity={50} tint="light" style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 300, stiffness: 200 }}
            style={styles.iconCircle}
          >
            {icon}
          </MotiView>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Body */}
        {children}
      </BlurView>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    overflow: "hidden",
  },

  header: {
    alignItems: "center",
    marginBottom: 24,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#19bdba",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },

  subtitle: {
    color: "#fff",
    fontSize: 15,
    opacity: 0.9,
  },
});