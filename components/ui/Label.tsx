import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

type LabelProps = TextProps & {
  children: React.ReactNode;
};

export function Label({ children, style, ...props }: LabelProps) {
  return (
    <Text style={[styles.label, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffffff", // gris oscuro (text-gray-700)
    marginBottom: 4,
  },
});