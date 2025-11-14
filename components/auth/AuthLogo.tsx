import React, { useEffect, useRef } from "react";
import { View, Image, Text, StyleSheet, Animated } from "react-native";

export default function AuthLogo({ subtitle = "Tu viaje comienza aquí" }: { subtitle?: string }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
  }, []);
  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <View style={styles.logoWrapper}>
        <Image source={require("../../assets/orbis-sin-fondo.png")} style={styles.logo} />
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 12 },
  logoWrapper: { width: 80, height: 80, borderRadius: 40, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  logo: { width: 72, height: 72, resizeMode: "contain" },
  subtitle: { color: "white", fontSize: 15, marginTop: 8, fontWeight: "600" }
});
