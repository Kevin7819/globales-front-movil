import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState, useRef } from "react"
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions
} from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker"
import ModalSelector from "react-native-modal-selector"
import { Button } from "../../components/ui/Button"
import { Card } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Label } from "../../components/ui/Label"
import { Separator } from "../../components/ui/Separator"
import { AuthApi } from "../../services/AuthApi"
import { locationService } from "../../services/LocationApi"

export default function RegisterScreen() {
  const router = useRouter()
  const [countries, setCountries] = useState([])
  const [languages, setLanguages] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [toast, setToast] = useState(null)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryOfOrigin: "",
    preferredLanguage: "",
    birthDate: "",
  })

  const fadeAnim = useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get("window").width

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true
    }).start()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cList, lList] = await Promise.all([
          locationService.fetchCountries(),
          locationService.fetchLanguages(),
        ])
        setCountries(cList.map((c, i) => ({ key: i, label: c })))
        setLanguages(lList.map((l, i) => ({ key: i, label: l })))
      } catch {
        setCountries([])
        setLanguages([])
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const showToast = (type, message, redirect) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
      if (redirect) router.push("/auth/login")
    }, 2500)
  }

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleDateConfirm = (date) => {
    const formatted = date.toISOString().split("T")[0]
    setForm((prev) => ({ ...prev, birthDate: formatted }))
    setShowDatePicker(false)
  }

  const validate = () => {
    if (form.firstName.trim().length < 2) return "El nombre debe tener al menos 2 caracteres."
    if (form.lastName.trim().length < 2) return "El apellido debe tener al menos 2 caracteres."
    if (!form.email.includes("@")) return "Correo electrónico inválido."
    if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres."
    if (form.password !== form.confirmPassword) return "Las contraseñas no coinciden."
    if (!form.countryOfOrigin) return "Selecciona tu país de origen."
    if (!form.preferredLanguage) return "Selecciona tu idioma preferido."
    if (!form.birthDate) return "Selecciona tu fecha de nacimiento."
    if (new Date(form.birthDate) > new Date()) return "La fecha de nacimiento no puede ser futura."
    return ""
  }

  const handleRegister = async () => {
    const err = validate()
    if (err) return showToast("error", err)

    try {
      setLoading(true)
      const fullName = `${form.firstName} ${form.lastName}`.trim()
      const res = await AuthApi.register(
        fullName,
        form.email,
        form.password,
        form.countryOfOrigin,
        form.preferredLanguage,
        new Date(form.birthDate)
      )

      if (res.isSuccess) {
        showToast("success", "Registro exitoso", true)
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          countryOfOrigin: "",
          preferredLanguage: "",
          birthDate: "",
        })
      } else showToast("error", res.message || "Error en el registro.")
    } catch (e) {
      showToast("error", e?.message || "No se pudo registrar el usuario.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Animated.View pointerEvents="none" style={[styles.clouds, { opacity: fadeAnim }]} />
      <Animated.View pointerEvents="none" style={[styles.clouds2, { opacity: fadeAnim }]} />
      <Animated.View pointerEvents="none" style={[styles.planes, { opacity: fadeAnim }]} />
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, zIndex: 2 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push("/")}>
              <View style={styles.backRow}>
                <Feather name="arrow-left" size={16} color="#93C5FD" />
                <Text style={styles.link}> Volver</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.brand}>
              <Feather name="globe" size={32} color="#BFDBFE" />
              <Text style={styles.brandTitle}>Orbis</Text>
            </View>

            <Text style={styles.subtitle}>Creá tu cuenta y viajá por el cosmos</Text>
          </View>

          <Card style={[styles.cardGlass, { zIndex: 3 }]}>
            <Text style={styles.cardTitle}>Crear Cuenta</Text>
            <Text style={styles.cardDesc}>Viajeros inteligentes te esperan</Text>

            <View style={styles.row}>
              <View style={styles.col}>
                <Label>Nombre</Label>
                <Input
                  placeholder="Juan"
                  value={form.firstName}
                  onChangeText={(t) => handleChange("firstName", t)}
                />
              </View>
              <View style={styles.col}>
                <Label>Apellido</Label>
                <Input
                  placeholder="Pérez"
                  value={form.lastName}
                  onChangeText={(t) => handleChange("lastName", t)}
                />
              </View>
            </View>

            <Label>Correo electrónico</Label>
            <Input
              placeholder="tu@email.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => handleChange("email", t)}
            />

            <Label>Contraseña</Label>
            <Input
              placeholder="••••••••"
              secureTextEntry
              value={form.password}
              onChangeText={(t) => handleChange("password", t)}
            />

            <Label>Confirmar Contraseña</Label>
            <Input
              placeholder="••••••••"
              secureTextEntry
              value={form.confirmPassword}
              onChangeText={(t) => handleChange("confirmPassword", t)}
            />

            <Label>Fecha de Nacimiento</Label>
            {Platform.OS === "web" ? (
              <View style={styles.dateInput}>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  style={styles.dateNative}
                />
                <Feather name="calendar" size={20} color="#93C5FD" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {form.birthDate || "Selecciona tu fecha"}
                </Text>
                <Feather name="calendar" size={20} color="#93C5FD" />
                <DateTimePickerModal
                  isVisible={showDatePicker}
                  mode="date"
                  onConfirm={handleDateConfirm}
                  onCancel={() => setShowDatePicker(false)}
                  maximumDate={new Date()}
                />
              </TouchableOpacity>
            )}

            <Label>País de Origen</Label>
            {loadingData ? (
              <ActivityIndicator color="#93C5FD" />
            ) : (
              <ModalSelector
                data={countries}
                initValue="Selecciona tu país"
                onChange={(o) => handleChange("countryOfOrigin", o.label)}
                style={styles.selector}
                selectStyle={styles.selectorInner}
                selectTextStyle={styles.selectorText}
                optionTextStyle={{ color: "#000" }}
              >
                <View style={styles.selectorInner}>
                  <Feather name="map-pin" size={18} color="#93C5FD" />
                  <Text style={styles.selectorText}>
                    {form.countryOfOrigin || "Selecciona tu país"}
                  </Text>
                </View>
              </ModalSelector>
            )}

            <Label>Idioma Preferido</Label>
            {loadingData ? (
              <ActivityIndicator color="#93C5FD" />
            ) : (
              <ModalSelector
                data={languages}
                initValue="Selecciona tu idioma"
                onChange={(o) => handleChange("preferredLanguage", o.label)}
                style={styles.selector}
                selectStyle={styles.selectorInner}
                selectTextStyle={styles.selectorText}
                optionTextStyle={{ color: "#000" }}
              >
                <View style={styles.selectorInner}>
                  <Feather name="globe" size={18} color="#93C5FD" />
                  <Text style={styles.selectorText}>
                    {form.preferredLanguage || "Selecciona tu idioma"}
                  </Text>
                </View>
              </ModalSelector>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#93C5FD" />
            ) : (
              <Button title="Crear Cuenta" onPress={handleRegister} style={{ marginTop: 12 }} />
            )}

            <Separator />

            <Text style={styles.footer}>
              ¿Ya tenés cuenta?{" "}
              <Text style={styles.link} onPress={() => router.push("/auth/login")}>
                Iniciar sesión
              </Text>
            </Text>
          </Card>
        </Animated.View>

        {toast && (
          <View style={[styles.toast, toast.type === "success" ? styles.toastSuccess : styles.toastError]}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0F29",
    alignItems: "center",
    justifyContent: "center"
  },
  clouds: {
    position: "absolute",
    width: "200%",
    height: "40%",
    top: 0,
    backgroundColor: "transparent",
    zIndex: 0
  },
  clouds2: {
    position: "absolute",
    width: "200%",
    height: "40%",
    top: 120,
    backgroundColor: "transparent",
    zIndex: 0
  },
  planes: {
    position: "absolute",
    top: 80,
    left: -100,
    width: 600,
    height: 600,
    backgroundColor: "transparent",
    borderRadius: 300,
    zIndex: 0
  },
  container: {
    flexGrow: 1,
    padding: 26,
    width: "100%",
    maxWidth: 480,
    zIndex: 2
  },
  header: { alignItems: "center", marginBottom: 24 },
  brand: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  backRow: { flexDirection: "row", alignItems: "center" },
  brandTitle: { fontSize: 26, fontWeight: "bold", marginLeft: 10, color: "#E0EAFF" },
  subtitle: { color: "#A5B4FC", marginTop: 6, fontSize: 15, textAlign: "center" },
  cardGlass: {
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    backdropFilter: "blur(12px)"
  },
  cardTitle: { color: "#E0EAFF", fontSize: 20, fontWeight: "bold" },
  cardDesc: { color: "#CBD5E1", marginBottom: 20 },
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    height: 45,
    borderRadius: 10,
    marginBottom: 12
  },
  dateNative: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "#fff"
  },
  dateText: {
    flex: 1,
    color: "#fff"
  },
  selector: {
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  selectorInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  selectorText: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    marginLeft: 6
  },
  footer: {
    textAlign: "center",
    color: "#A5B4FC",
    marginTop: 16,
    fontSize: 14
  },
  link: { color: "#93C5FD", fontWeight: "700" },
  toast: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    padding: 14,
    borderRadius: 10,
    alignItems: "center"
  },
  toastText: { color: "#fff", fontWeight: "700" },
  toastSuccess: { backgroundColor: "#16A34A" },
  toastError: { backgroundColor: "#DC2626" }
})
