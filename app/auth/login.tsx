import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Separator } from "../../components/ui/Separator";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Login with:", { email, password });
    // 👉 lógica de autenticación con .NET
    router.push("/dashboard");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="globe-outline" size={48} color="#2563EB" />
        <Text style={styles.headerTitle}>Se tiene que pensar</Text>
        <Text style={styles.headerSubtitle}>Inicia sesión en tu cuenta</Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <Label>Correo electrónico</Label>
        <Input
          placeholder="tu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Label>Contraseña</Label>
        <Input
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.row}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.remember}> Recordarme</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>

        <Button title="Iniciar Sesión" onPress={handleLogin} style={{ marginTop: 8 }} />

        <Separator />

        <Text style={styles.footer}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => router.push("/auth/register")}>
            Regístrate aquí
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  form: {
    width: "100%",
    maxWidth: 350,
    marginTop: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  remember: {
    fontSize: 12,
    color: "#6B7280",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
  },
  link: {
    color: "#2563EB",
    fontWeight: "600",
  },
});