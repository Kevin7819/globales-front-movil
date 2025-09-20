import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Separator } from "../../components/ui/Separator";
import { Card } from "../../components/ui/Card";

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    console.log("Register with:", form);
    // 👉 Aquí iría la lógica para registrar con tu backend .NET
    router.push("/dashboard");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="arrow-left" size={16} color="#2563EB" />
            <Text style={styles.link}> Volver al inicio</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.brand}>
          <Feather name="globe" size={28} color="#2563EB" />
          <Text style={styles.brandTitle}><Orbis></Orbis></Text>
        </View>

        <Text style={styles.subtitle}>Crea tu cuenta gratuita</Text>
      </View>

      {/* Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Crear Cuenta</Text>
          <Text style={styles.cardDesc}>Únete a miles de viajeros inteligentes</Text>
        </View>

        <View>
          {/* Nombre y Apellido */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Label>Nombre</Label>
              <Input
                placeholder="Juan"
                value={form.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
              />
            </View>
            <View style={styles.col}>
              <Label>Apellido</Label>
              <Input
                placeholder="Pérez"
                value={form.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
              />
            </View>
          </View>

          {/* Email */}
          <Label>Correo electrónico</Label>
          <Input
            placeholder="tu@email.com"
            value={form.email}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password */}
          <Label>Contraseña</Label>
          <Input
            placeholder="••••••••"
            value={form.password}
            onChangeText={(text) => handleChange("password", text)}
            secureTextEntry
          />

          <Label>Confirmar Contraseña</Label>
          <Input
            placeholder="••••••••"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
            secureTextEntry
          />

          {/* Terms */}
          <Text style={styles.terms}>
            Acepto los{" "}
            <Text style={styles.link} onPress={() => router.push("/terms")}>
              términos y condiciones
            </Text>{" "}
            y la{" "}
            <Text style={styles.link} onPress={() => router.push("/privacy")}>
              política de privacidad
            </Text>.
          </Text>

          {/* Botón */}
          <Button title="Crear Cuenta" onPress={handleRegister} style={{ marginTop: 12 }} />

          <Separator />

          <Text style={styles.footer}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.link} onPress={() => router.push("/auth/login")}>
              Inicia sesión
            </Text>
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: "#EEF2FF" },
  header: { alignItems: "center", marginBottom: 20 },
  brand: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  brandTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 8, color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginTop: 6 },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  terms: { fontSize: 12, color: "#6B7280", marginVertical: 12 },
  footer: { textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 20 },
  link: { color: "#2563EB", fontWeight: "600" },
});