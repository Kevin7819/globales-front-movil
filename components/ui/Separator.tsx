import React from "react";
import { View, StyleSheet } from "react-native";

type SeparatorProps = {
  orientation?: "horizontal" | "vertical";
  style?: any;
};

export function Separator({ orientation = "horizontal", style }: SeparatorProps) {
  if (orientation === "vertical") {
    return <View style={[styles.vertical, style]} />;
  }
  return <View style={[styles.horizontal, style]} />;
}

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    backgroundColor: "#E5E7EB", // gris claro (equivalente a border-gray-200)
    marginVertical: 12,
  },
  vertical: {
    width: 1,
    backgroundColor: "#E5E7EB",
    alignSelf: "stretch",
  },
});