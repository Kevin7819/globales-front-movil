import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ModalSelector from "react-native-modal-selector";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Separator } from "../../components/ui/Separator";
import { userService } from "../../services/UserApi";
import { locationService } from "../../services/LocationApi";

export default function EditProfileScreen() {
    const router = useRouter();

    const [countries, setCountries] = useState<{ key: number; label: string }[]>([]);
    const [languages, setLanguages] = useState<{ key: number; label: string }[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const [form, setForm] = useState({
        id: 0,
        name: "",
        email: "",
        countryOfOrigin: "",
        preferredLanguage: "",
        birthDate: "",
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [user, cList, lList] = await Promise.all([
                    userService.getCurrentUser(),
                    locationService.fetchCountries(),
                    locationService.fetchLanguages(),
                ]);

                setCountries(cList.map((c, i) => ({ key: i, label: c.name || c })));
                setLanguages(lList.map((l, i) => ({ key: i, label: l })));

                setForm({
                    id: user.userId,
                    name: user.name || "",
                    email: user.email || "",
                    countryOfOrigin: user.countryOfOrigin || "",
                    preferredLanguage: user.preferredLanguage || "",
                    birthDate: user.birthDate?.split("T")[0] || "",
                });
            } catch (err) {
                console.error(err);
                showToast("error", "Error al cargar datos de usuario.");
            } finally {
                setLoading(false);
                setLoadingData(false);
            }
        };
        loadData();
    }, []);

    const showToast = (type: "success" | "error", message: string, redirect?: boolean) => {
        setToast({ type, message });
        setTimeout(() => {
            setToast(null);
            if (redirect) router.back();
        }, 2500);
    };

    const handleChange = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleDateConfirm = (date: Date) => {
        const formatted = date.toISOString().split("T")[0];
        setForm((prev) => ({ ...prev, birthDate: formatted }));
        setShowDatePicker(false);
    };

    const handleSave = async () => {
        if (!form.name.trim()) return showToast("error", "El nombre es obligatorio.");
        setSaving(true);
        try {
            await userService.updateUser(form.id, {
                name: form.name,
                email: form.email,
                countryOfOrigin: form.countryOfOrigin,
                preferredLanguage: form.preferredLanguage,
                birthDate: form.birthDate,
            });
            showToast("success", "Perfil actualizado correctamente ✅");
            setTimeout(() => {
                router.replace("/dashboard");
            }, 1500);
        } catch (err) {
            console.error(err);
            showToast("error", "No se pudo actualizar el perfil.");
        } finally {
            setSaving(false);
        }
    };


    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={{ color: "#6B7280", marginTop: 8 }}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Feather name="arrow-left" size={18} color="#2563EB" />
                    <Text style={styles.link}> Volver</Text>
                </View>
            </TouchableOpacity>

            <Card>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Editar Perfil</Text>
                    <Text style={styles.cardDesc}>Actualiza tus datos personales</Text>
                </View>

                {/* Nombre */}
                <Label>Nombre</Label>
                <Input value={form.name} onChangeText={(t) => handleChange("name", t)} placeholder="Tu nombre" />

                {/* Email */}
                <Label>Correo electrónico</Label>
                <Input value={form.email} editable={false} placeholder="Tu correo" />

                {/* Fecha nacimiento */}
                <Label>Fecha de nacimiento</Label>
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
                                fontFamily: "inherit",
                            }}
                        />
                        <Feather name="calendar" size={20} color="#2563EB" style={styles.dateIconUnified} />
                    </View>
                ) : (
                    <TouchableOpacity style={styles.dateInputUnified} onPress={() => setShowDatePicker(true)}>
                        <Text style={[styles.dateText, { color: form.birthDate ? "#111827" : "#9CA3AF" }]}>
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

                {/* País */}
                <Label>País de origen</Label>
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

                {/* Idioma */}
                <Label>Idioma preferido</Label>
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

                {saving ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 12 }} />
                ) : (
                    <Button title="Guardar cambios" onPress={handleSave} style={{ marginTop: 12 }} />
                )}

                <Separator />
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
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: "#EEF2FF" },
    link: { color: "#2563EB", fontWeight: "600" },
    cardHeader: { marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
    cardDesc: { fontSize: 14, color: "#6B7280" },
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
    dateText: { flex: 1, fontSize: 14, paddingRight: 8 },
    dateIconUnified: { marginLeft: 4 },
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
    centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
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
});