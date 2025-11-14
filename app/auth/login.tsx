import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useState, useEffect, useRef } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Easing
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Path } from "react-native-svg"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Separator } from "../../components/ui/Separator"
import { AuthApi } from "../../services/AuthApi"

const { width, height } = Dimensions.get("window")

export default function LoginScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [toast, setToast] = useState(null)

  const formAnim = useRef(new Animated.Value(0)).current

  const clouds = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0))
  ).current

  const airplanes = useRef(
    Array.from({ length: 3 }, () => new Animated.Value(0))
  ).current

  useEffect(() => {
    Animated.timing(formAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true
    }).start()

    clouds.forEach((ref) => {
      const startX = Math.random() * (width + 600) - 400
      ref.setValue(startX)

      const duration = 22000 + Math.random() * 16000
      const delay = Math.random() * 8000

      Animated.loop(
        Animated.sequence([
          Animated.timing(ref, {
            toValue: width + 400,
            duration,
            delay,
            useNativeDriver: true,
            easing: Easing.linear
          }),
          Animated.timing(ref, {
            toValue: -400,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start()
    })

    airplanes.forEach((a, index) => {
      const fromRight = Math.random() > 0.5
      const start = fromRight ? width + 200 : -200
      const end = fromRight ? -200 : width + 200

      a.setValue(start)

      setTimeout(() => {
        Animated.loop(
          Animated.timing(a, {
            toValue: end,
            duration: 12000 + Math.random() * 7000,
            easing: Easing.linear,
            useNativeDriver: true
          })
        ).start()
      }, index * 2000 + Math.random() * 1500)
    })
  }, [])

  const showToast = (type, message, redirect) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
      if (redirect) router.replace("/dashboard")
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
        if (res.user) {
          await AsyncStorage.multiSet([
            ["token", res.user.token],
            ["userId", String(res.user.id)],
            ["role", res.user.role],
          ])
        }
        showToast("success", "Bienvenido a Orbis", true)
      } else {
        showToast("error", "Datos incorrectos")
      }
    } catch {
      showToast("error", "Datos incorrectos")
    } finally {
      setLoading(false)
    }
  }

  const renderClouds = () =>
    clouds.map((c, index) => {
      const top = Math.random() * (height * 0.5)
      const size = 90 + Math.random() * 50

      return (
        <Animated.View
          key={index}
          style={{
            position: "absolute",
            top,
            transform: [{ translateX: c }],
            opacity: 0.5
          }}
        >
          <Svg width={size} height={size * 0.6} viewBox="0 0 200 120">
            <Path
              d="M30 80c-20-40 40-70 70-30 20-30 80-20 70 25 25 10 20 50-40 40H50S0 120 30 80z"
              fill="rgba(255,255,255,0.9)"
            />
          </Svg>
        </Animated.View>
      )
    })

  const renderAirplanes = () => {
    const icons = [
      "airplane",
      "airplane-outline",
      "paper-plane"
    ]

    return airplanes.map((a, i) => {
      const size = 32 + Math.random() * 10
      const top = 10 + Math.random() * 30

      return (
        <Animated.View
          key={i}
          style={{
            position: "absolute",
            top,
            transform: [{ translateX: a }],
            opacity: 0.9
          }}
        >
          <Ionicons name={icons[i]} size={size} color="#ffffffdd" />
        </Animated.View>
      )
    })
  }

  const formStyle = {
    opacity: formAnim,
    transform: [
      {
        scale: formAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1]
        })
      },
      {
        translateY: formAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0]
        })
      }
    ]
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#020617", "#0B1B33", "#1E3A8A", "#60A5FA"]}
        locations={[0, 0.3, 0.65, 1]}
        style={styles.background}
      />

      <View style={styles.stars}>
        {Array.from({ length: 70 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: Math.random() * width,
              top: Math.random() * height * 0.5,
              width: 2,
              height: 2,
              borderRadius: 2,
              opacity: 0.2 + Math.random(),
              backgroundColor: "#fff"
            }}
          />
        ))}
      </View>

      {renderClouds()}
      {renderAirplanes()}

      <View style={styles.sun}>
        <MaterialCommunityIcons name="white-balance-sunny" size={70} color="#ffdf6e" />
      </View>

      <View style={styles.moon}>
        <Ionicons name="moon" size={40} color="#c7d2fe" />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.header, formStyle]}>
          <Ionicons name="airplane" size={60} color="#FFF" />
          <Text style={styles.headerTitle}>Orbis Airlines</Text>
          <Text style={styles.headerSubtitle}>Tu viaje comienza aquí</Text>
        </Animated.View>

        <Animated.View style={[styles.form, formStyle]}>
          <Label>Correo electrónico</Label>
          <Input
            placeholder="Ej: correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
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
            <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 12 }} />
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
        </Animated.View>
      </View>

      {toast && (
        <View
          style={[
            styles.toast,
            toast.type === "success" ? styles.toastSuccess : styles.toastError
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
  stars: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  header: { alignItems: "center", marginBottom: 40 },
  headerTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFF",
    marginTop: 15,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#e2e8f0",
    marginTop: 8,
    textAlign: "center",
    fontWeight: "500"
  },
  form: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 32,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 12 },
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  footer: {
    marginTop: 24,
    fontSize: 14,
    textAlign: "center",
    color: "#e2e8f0"
  },
  link: { color: "#fff", fontWeight: "700" },
  errorText: { color: "#fecaca", textAlign: "center", marginTop: 6, marginBottom: 8 },
  toast: {
    position: "absolute",
    bottom: 50,
    left: 24,
    right: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 15
  },
  toastText: { color: "#FFF", fontWeight: "700" },
  toastSuccess: { backgroundColor: "rgba(22,163,74,0.9)" },
  toastError: { backgroundColor: "rgba(220,38,38,0.9)" },
  sun: { position: "absolute", top: "10%", right: "10%" },
  moon: { position: "absolute", top: "15%", left: "10%" }
})
