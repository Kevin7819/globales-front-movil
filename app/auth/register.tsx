import { Feather } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const [countries, setCountries] = useState<{ key: number; label: string }[]>([])
  const [languages, setLanguages] = useState<{ key: number; label: string }[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cList, lList] = await Promise.all([locationService.fetchCountries(), locationService.fetchLanguages()])
        setCountries(cList.map((c, i) => ({ key: i, label: c })))
        setLanguages(lList.map((l, i) => ({ key: i, label: l })))
      } catch {
        showToast("error", "No se pudieron cargar países o idiomas.")
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const showToast = (type: "success" | "error", message: string, redirect?: boolean) => {
    setToast({ type, message })
    setTimeout(() => {
      setToast(null)
      if (redirect) router.push("/auth/login")
    }, 2500)
  }

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleDateConfirm = (date: Date) => {
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
    if (err) {
      showToast("error", err)
      return
    }

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
        showToast("success", "Registro exitoso ✅", true)
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
      } else {
        showToast("error", res.message || "Error en el registro.")
      }
    } catch (e: any) {
      showToast("error", e?.message || "No se pudo registrar el usuario.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Feather name="arrow-left" size={16} color="#2563EB" />
            <Text style={styles.link}> Volver al inicio</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.brand}>
          <Feather name="globe" size={28} color="#2563EB" />
          <Text style={styles.brandTitle}>Orbis</Text>
        </View>

        <Text style={styles.subtitle}>Crea tu cuenta gratuita</Text>
      </View>

      <Card>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Crear Cuenta</Text>
          <Text style={styles.cardDesc}>Únete a miles de viajeros inteligentes</Text>
        </View>

        <View>
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
            autoCapitalize="none"
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
            <View style={styles.dateInputUnified}>
              {/* @ts-ignore */}
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={{
                  flex: 1,
                  color: "#111827",
                  fontSize: 14,
                  border: "none",
                  background: "transparent",
                  height: 40,
                  outline: "none",
                  paddingRight: 8,
                  fontFamily: "inherit",
                }}
              />
              <Feather name="calendar" size={20} color="#2563EB" style={styles.dateIconUnified} />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dateInputUnified}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dateText,
                  { color: form.birthDate ? "#111827" : "#9CA3AF" },
                ]}
              >
                {form.birthDate || "Selecciona tu fecha"}
              </Text>
              <Feather name="calendar" size={20} color="#2563EB" style={styles.dateIconUnified} />
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
            <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />
          ) : (
            <ModalSelector
              data={countries}
              initValue="Selecciona tu país"
              onChange={(option) => handleChange("countryOfOrigin", option.label)}
              style={styles.selectorWrapper}
              initValueTextStyle={styles.selectorText}
              selectTextStyle={styles.selectorText}
              optionTextStyle={{ color: "#111827" }}
              selectStyle={styles.select}
              cancelText="Cancelar"
            >
              <View style={styles.selectInner}>
                <Feather name="map-pin" size={18} color="#2563EB" style={styles.icon} />
                <Text style={styles.selectorText}>
                  {form.countryOfOrigin || "Selecciona tu país"}
                </Text>
              </View>
            </ModalSelector>
          )}

          <Label>Idioma Preferido</Label>
          {loadingData ? (
            <ActivityIndicator color="#2563EB" style={{ marginVertical: 10 }} />
          ) : (
            <ModalSelector
              data={languages}
              initValue="Selecciona tu idioma"
              onChange={(option) => handleChange("preferredLanguage", option.label)}
              style={styles.selectorWrapper}
              initValueTextStyle={styles.selectorText}
              selectTextStyle={styles.selectorText}
              optionTextStyle={{ color: "#111827" }}
              selectStyle={styles.select}
              cancelText="Cancelar"
            >
              <View style={styles.selectInner}>
                <Feather name="globe" size={18} color="#2563EB" style={styles.icon} />
                <Text style={styles.selectorText}>
                  {form.preferredLanguage || "Selecciona tu idioma"}
                </Text>
              </View>
            </ModalSelector>
          )}

          {loading ? (
            <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 12 }} />
          ) : (
            <Button title="Crear Cuenta" onPress={handleRegister} style={{ marginTop: 12 }} />
          )}

          <Separator />

          <Text style={styles.footer}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.link} onPress={() => router.push("/auth/login")}>
              Inicia sesión
            </Text>
          </Text>
        </View>
      </Card>

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
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#EEF2FF" },
  header: { alignItems: "center", marginBottom: 20 },
  brand: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  brandTitle: { fontSize: 22, fontWeight: "bold", marginLeft: 8, color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginTop: 6 },
  cardHeader: { marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardDesc: { fontSize: 14, color: "#6B7280" },
  row: { flexDirection: "row", gap: 8 },
  col: { flex: 1 },
  footer: { textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 20 },
  link: { color: "#2563EB", fontWeight: "600" },
  dateInputUnified: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#2563EB",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 6,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 8,
    height: 45,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    paddingRight: 8,
  },
  dateIconUnified: {
    marginLeft: 4,
  },
  selectorWrapper: {
    marginTop: 6,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#2563EB",
    backgroundColor: "#fff",
  },
  select: { borderWidth: 0, backgroundColor: "transparent" },
  selectInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  selectorText: { color: "#111827", fontSize: 14 },
  icon: { marginRight: 6 },
  toast: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  toastSuccess: { backgroundColor: "#16A34A" },
  toastError: { backgroundColor: "#DC2626" },
})