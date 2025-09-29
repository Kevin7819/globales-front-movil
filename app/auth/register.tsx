import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Separator } from "../../components/ui/Separator";
import { Card } from "../../components/ui/Card";
import { registerUser } from "../../services/api";

export default function RegisterScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "", // YYYY-MM-DD
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleDateConfirm = (date: Date) => {
    const formatted = date.toISOString().split("T")[0];
    setForm({ ...form, birthDate: formatted });
    setShowDatePicker(false);
  };

  const showToast = (type: "success" | "error", message: string, redirect?: boolean) => {
    setToast({ type, message });

    setTimeout(() => {
      setToast(null);
      if (redirect) {
        router.push("/auth/login");
      }
    }, 3000); // 3 segundos
  };

  const validateForm = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setErrorMessage("El nombre y apellido son obligatorios");
      return false;
    }
    if (!form.email.includes("@")) {
      setErrorMessage("Correo electrónico inválido");
      return false;
    }
    if (form.password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return false;
    }
    if (!form.birthDate) {
      setErrorMessage("Debes seleccionar tu fecha de nacimiento");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        userName: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        countryOfOrigin: "Costa Rica",
        preferredLanguage: "es",
        birthDate: form.birthDate,
      };

      await registerUser(payload);

      showToast("success", "Usuario registrado correctamente ✅", true);
    } catch (err: any) {
      showToast("error", err.message || "No se pudo registrar el usuario");
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.brandTitle}>Orbiss</Text>
        </View>

        <Text style={styles.subtitle}>Crea tu cuenta gratuita</Text>
      </View>

      {/* Card */}
      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Crear Cuenta</Text>
          <Text style={styles.cardDesc}>
            Únete a miles de viajeros inteligentes
          </Text>
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

          {/* BirthDate */}
          <Label>Fecha de nacimiento</Label>
          {Platform.OS === "web" ? (
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={form.birthDate}
              onChangeText={(text) => handleChange("birthDate", text)}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={{ color: form.birthDate ? "#111827" : "#9CA3AF" }}
                >
                  {form.birthDate || "Selecciona tu fecha"}
                </Text>
                <Feather name="calendar" size={18} color="#6B7280" />
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
              />
            </>
          )}

          {/* Mensaje de error visible */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Loader o Botón */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#2563EB"
              style={{ marginTop: 12 }}
            />
          ) : (
            <Button
              title="Crear Cuenta"
              onPress={handleRegister}
              style={{ marginTop: 12 }}
            />
          )}

          <Separator />

          <Text style={styles.footer}>
            ¿Ya tienes cuenta?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("/auth/login")}
            >
              Inicia sesión
            </Text>
          </Text>
        </View>
      </Card>

      {/* Toast flotante */}
      {toast && (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#EEF2FF",
  },
  header: { alignItems: "center", marginBottom: 20 },
  brand: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  brandTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#111827",
  },
  subtitle: { fontSize: 14, color: "#4B5563", marginTop: 6 },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  footer: {
    textAlign: "center",
    fontSize: 14,
    color: "#6B7280",
    marginTop: 20,
  },
  link: { color: "#2563EB", fontWeight: "600" },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginTop: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  toast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  toastSuccess: {
    backgroundColor: "#16A34A",
  },
  toastError: {
    backgroundColor: "#DC2626",
  },
});