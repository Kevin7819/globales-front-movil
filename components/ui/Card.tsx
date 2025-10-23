import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.05)",
    elevation: 2,
    marginBottom: 12,
  },
});