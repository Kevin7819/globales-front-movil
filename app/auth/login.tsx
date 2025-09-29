import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Label } from "../../components/ui/Label";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Separator } from "../../components/ui/Separator";

import { loginUser } from "../../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string, redirect?: boolean) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
      if (redirect) {
        router.push("/dashboard");
      }
    }, 2000);
  };

  const validateForm = () => {
    if (!userName.trim() || !password.trim()) {
      setErrorMessage("Usuario y contraseña son obligatorios");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = { userName, password }; 
      const data = await loginUser(payload);

      if (data.isSuccess) {
        await AsyncStorage.setItem("authToken", data.user.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));
        showToast("success", "Inicio de sesión exitoso ✅", true);
      } else {
        showToast("error", data.message || "Credenciales inválidas");
      }
    } catch (err: any) {
      showToast("error", err.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="globe-outline" size={48} color="#2563EB" />
        <Text style={styles.headerTitle}>Orbis</Text>
        <Text style={styles.headerSubtitle}>Inicia sesión con tu usuario</Text>
      </View>

      {/* Formulario */}
      <View style={styles.form}>
        <Label>Usuario</Label>
        <Input
          placeholder="Ej: Bellaqueo14"
          value={userName}
          onChangeText={setUserName}
          autoCapitalize="none"
        />

        <Label>Contraseña</Label>
        <Input
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 12 }} />
        ) : (
          <Button title="Iniciar Sesión" onPress={handleLogin} style={{ marginTop: 8 }} />
        )}

        <Separator />

        <Text style={styles.footer}>
          ¿No tienes cuenta?{" "}
          <Text style={styles.link} onPress={() => router.push("/auth/register")}>
            Regístrate aquí
          </Text>
        </Text>
      </View>

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