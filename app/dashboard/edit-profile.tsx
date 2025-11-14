import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ModalSelector from "react-native-modal-selector";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Label } from "../../components/ui/Label";
import { Separator } from "../../components/ui/Separator";
import { locationService } from "../../services/LocationApi";
import { userService } from "../../services/UserApi";

export default function EditProfileScreen() {
    const router = useRouter();

    // 👇 Agregado: ref para el date input de web
    const webDateRef = useRef<any>(null);

    const [countries, setCountries] = useState<{ key: number; label: string }[]>([]);
    const [languages, setLanguages] = useState<{ key: number; label: string }[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toast, setToast] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

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

                setCountries(
                    cList.map((c, i) => ({ key: i, label: (c as any).name ? (c as any).name : String(c) }))
                );
                setLanguages(lList.map((l, i) => ({ key: i, label: l })));

                setForm({
                    id: user.userId,
                    name: user.name || "",
                    email: user.email || "",
                    countryOfOrigin: user.countryOfOrigin || "",
                    preferredLanguage: user.preferredLanguage || "",
                    birthDate: (user as any).birthDate?.split("T")[0] || "",
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

    const showToast = (
        type: "success" | "error",
        message: string,
        redirect?: boolean
    ) => {
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
            } as any);
            // Mostrar overlay bonito de éxito y luego redirigir
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
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
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={{ color: "#CBD5E1", marginTop: 8 }}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                    <Feather name="arrow-left" size={18} color="#A5B4FC" />
                    <Text style={styles.link}> Volver</Text>
                </View>
            </TouchableOpacity>

            <Card style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Editar Perfil</Text>
                    <Text style={styles.cardDesc}>Actualiza tus datos personales</Text>
                </View>

                {/* Nombre */}
                <Label style={styles.label}>Nombre</Label>
                <Input
                    value={form.name}
                    onChangeText={(t) => handleChange("name", t)}
                    placeholder="Tu nombre"
                    style={styles.input}
                />

                {/* Email */}
                <Label style={styles.label}>Correo electrónico</Label>
                <Input value={form.email} editable={false} placeholder="Tu correo" style={styles.inputDisabled} />

                {/* Fecha de nacimiento */}
                <Label style={styles.label}>Fecha de nacimiento</Label>

                {Platform.OS === "web" ? (
                    <View style={styles.dateWebWrapper}>
                        <input
                            ref={webDateRef}
                            type="date"
                            value={form.birthDate}
                            onChange={(e) => handleChange("birthDate", e.target.value)}
                            max={new Date().toISOString().split("T")[0]}
                            style={styles.hiddenWebDateInput}
                        />

                        <TouchableOpacity
                            onPress={() => {
                                if (webDateRef.current) {
                                    if (webDateRef.current.showPicker) {
                                        webDateRef.current.showPicker();
                                    } else {
                                        webDateRef.current.click();
                                    }
                                }
                            }}
                            style={styles.dateWebDisplay}
                        >
                            <Text
                                style={[
                                    styles.dateText,
                                    { color: form.birthDate ? "#E0E7FF" : "#94A3B8" },
                                ]}
                            >
                                {form.birthDate || "Selecciona tu fecha"}
                            </Text>

                            <Feather name="calendar" size={20} color="#A5B4FC" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.dateWebDisplay}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text
                            style={[
                                styles.dateText,
                                { color: form.birthDate ? "#E0E7FF" : "#94A3B8" },
                            ]}
                        >
                            {form.birthDate || "Selecciona tu fecha"}
                        </Text>
                        <Feather name="calendar" size={20} color="#A5B4FC" />

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
                <Label style={styles.label}>País de origen</Label>
                {loadingData ? (
                    <ActivityIndicator color="#A5B4FC" style={{ marginVertical: 10 }} />
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
                            <Feather name="map-pin" size={18} color="#A5B4FC" style={styles.icon} />
                            <Text style={styles.selectorText}>
                                {form.countryOfOrigin || "Selecciona tu país"}
                            </Text>
                        </View>
                    </ModalSelector>
                )}

                {/* Idioma */}
                <Label style={styles.label}>Idioma preferido</Label>
                {loadingData ? (
                    <ActivityIndicator color="#A5B4FC" style={{ marginVertical: 10 }} />
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
                            <Feather name="globe" size={18} color="#A5B4FC" style={styles.icon} />
                            <Text style={styles.selectorText}>
                                {form.preferredLanguage || "Selecciona tu idioma"}
                            </Text>
                        </View>
                    </ModalSelector>
                )}

                {saving ? (
                    <ActivityIndicator size="large" color="#A5B4FC" style={{ marginTop: 12 }} />
                ) : (
                    <Button title="Guardar cambios" onPress={handleSave} style={{ marginTop: 12 }} />
                )}

                <Separator />
            </Card>

            {toast && (
                <View
                    style={[
                        styles.toast,
                        toast.type === "success"
                            ? styles.toastSuccess
                            : styles.toastError,
                    ]}
                >
                    <Text style={styles.toastText}>{toast.message}</Text>
                </View>
            )}

            {showSuccess && (
                <View style={styles.successOverlay} pointerEvents="box-none">
                    <View style={styles.successBox}>
                        <Feather name="check" size={36} color="#fff" />
                        <Text style={styles.successText}>Perfil actualizado correctamente</Text>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: "#0F0F2F",
    },

    link: {
        color: "#A5B4FC",
        fontWeight: "600",
    },

    card: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 18,
        padding: 20,
        shadowColor: "#6366F1",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
    },

    cardHeader: { marginBottom: 16 },

    cardTitle: { fontSize: 20, fontWeight: "bold", color: "#E0E7FF" },

    cardDesc: { fontSize: 14, color: "#94A3B8" },

    label: { color: "#CBD5E1" },

    input: {
        backgroundColor: "rgba(255,255,255,0.08)",
        color: "#E0E7FF",
    },

    inputDisabled: {
        backgroundColor: "rgba(255,255,255,0.05)",
        color: "#94A3B8",
    },

    dateWebWrapper: {
        marginTop: 6,
        marginBottom: 12,
        position: "relative",
    },

    hiddenWebDateInput: {
        position: "absolute",
        opacity: 0,
        pointerEvents: "none",
        width: 0,
        height: 0,
    },

    dateWebDisplay: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1.2,
        borderColor: "rgba(140,140,255,0.4)",
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        shadowColor: "#A5B4FC",
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        marginBottom: 12,
    },

    dateText: { flex: 1, fontSize: 14 },

    selectorWrapper: {
        marginTop: 6,
        marginBottom: 12,
        borderRadius: 12,
        borderWidth: 1.2,
        borderColor: "rgba(140,140,255,0.4)",
        backgroundColor: "rgba(255,255,255,0.08)",
    },

    select: { borderWidth: 0, backgroundColor: "transparent" },

    selectInner: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
    },

    selectorText: { color: "#E0E7FF", fontSize: 14 },

    icon: { marginRight: 6 },

    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0F0F2F",
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

    toastText: { color: "#fff", fontSize: 14, fontWeight: "600" },

    toastSuccess: { backgroundColor: "#16A34A" },

    toastError: { backgroundColor: "#DC2626" },
    successOverlay: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 24,
        justifyContent: "flex-end",
        alignItems: "center",
        zIndex: 9999,
        pointerEvents: 'box-none',
    },
    successBox: {
        width: '100%',
        backgroundColor: '#16A34A',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    successText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        textAlign: 'center',
    },
});
