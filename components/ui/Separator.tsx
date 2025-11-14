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
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
  vertical: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "stretch",
  },
});