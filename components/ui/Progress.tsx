import { View, StyleSheet } from "react-native";

export function Progress({ value, color = "#16A34A" }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${value}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: 6,
    borderRadius: 4,
  },
});