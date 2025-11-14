import React from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { MotiView } from "moti";

type AuthLogoProps = {
  subtitle?: string;
};

export function AuthLogo({ subtitle = "Tu viaje comienza aquí" }: AuthLogoProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
      style={styles.container}
    >
      <MotiView
        from={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 200, stiffness: 200 }}
        style={styles.logoWrapper}
      >
        <Image
          source={require("../../assets/orbis-sin-fondo.png")} // ACOMODALO A TU RUTA
          style={styles.logo}
          resizeMode="contain"
        />
      </MotiView>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrapper: {
    marginBottom: 8,
  },
  logo: {
    height: 70,
    width: 70,
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
  },
});