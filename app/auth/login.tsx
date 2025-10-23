import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Separator } from "../../components/ui/Separator"
import { AuthApi } from "../../services/authApi"

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")    
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (type: "success" | "error", message: string, redirect?: boolean) => {
    setToast({ type, message })
    setTimeout(async () => {
      setToast(null)
      if (redirect) {
        router.replace("/dashboard")
      }
    }, 1800)
  }

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {  
      setErrorMessage("Correo electrónico y contraseña son obligatorios")
      return false
    }
    setErrorMessage("")
    return true
  }

  const handleLogin = async () => {
    if (!validateForm()) return
    setLoading(true)
    try {
      const res = await AuthApi.login(email, password) 
      if (res.isSuccess) {
        try {
          if (res.user) {
            await AsyncStorage.multiSet([
              ["token", res.user.token],
              ["userId", String(res.user.id)],
              ["role", res.user.role],
            ])
          }
        } catch (storageErr) {
          console.error("Error guardando en AsyncStorage:", storageErr)
        }

        showToast("success", "¡Bienvenido! Redirigiendo al dashboard...", true)
      } else {
        showToast(
          "error",
          res.message && res.message.toLowerCase().includes("invalid")
            ? "Correo o contraseña incorrectos. Por favor, verifica tus datos."
            : res.message || "No se pudo iniciar sesión. Intenta nuevamente."
        )
      }
    } catch (err: any) {
      console.error("Error en login:", err)
      showToast("error", "Ocurrió un error inesperado. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="globe-outline" size={48} color="#2563EB" />
        <Text style={styles.headerTitle}>Orbis</Text>
        <Text style={styles.headerSubtitle}>Inicia sesión con tu correo electrónico</Text>
      </View>

      <View style={styles.form}>
        <Label>Correo electrónico</Label>
        <Input
          placeholder="Ej: correo@ejemplo.com"
          value={email}           
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
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
  )
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
})
