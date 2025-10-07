import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { Avatar } from "../../components/ui/Avatar";
import { Platform } from "react-native";

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [upcomingTrips] = useState([
    {
      id: 1,
      destination: "Tokio, Japón",
      date: "15 Mar 2024",
      airline: "AeroMéxico",
      status: "confirmed",
      healthScore: 85,
      culturalScore: 70,
    },
    {
      id: 2,
      destination: "París, Francia",
      date: "22 Abr 2024",
      airline: "Air France",
      status: "pending",
      healthScore: 95,
      culturalScore: 90,
    },
  ]);

  const [alerts] = useState([
    {
      id: 1,
      type: "health",
      title: "Vacuna recomendada para Japón",
      description: "Se recomienda vacuna contra la encefalitis japonesa",
      date: "Hace 2 horas",
    },
    {
      id: 2,
      type: "cultural",
      title: "Costumbres en Tokio",
      description:
        "Evita señalar con el dedo y quítate los zapatos en interiores",
      date: "Hace 1 día",
    },
  ]);

  // 🚀 Verificación de autenticación
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (!savedUser) {
          router.replace("/auth/login");
          return;
        }
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("Error cargando usuario:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // 🚪 Logout
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      // 🧠 En web no existe Alert.alert, así que usamos confirm()
      const confirmLogout = window.confirm("¿Seguro que querés cerrar sesión?");
      if (!confirmLogout) return;

      try {
        setLoggingOut(true);
        await AsyncStorage.removeItem("user");
        router.replace("/auth/login");
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
        alert("Error: no se pudo cerrar sesión correctamente.");
      } finally {
        setLoggingOut(false);
      }
    } else {
      // 📱 En Android/iOS usamos Alert nativo
      Alert.alert(
        "Cerrar sesión",
        "¿Seguro que querés cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, salir",
            style: "destructive",
            onPress: async () => {
              try {
                setLoggingOut(true);
                await AsyncStorage.removeItem("user");
                router.replace("/auth/login");
              } catch (err) {
                console.error("Error al cerrar sesión:", err);
                Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
              } finally {
                setLoggingOut(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };


  if (loading || loggingOut) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8 }}>
          {loggingOut ? "Cerrando sesión..." : "Cargando dashboard..."}
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Redirigiendo al login...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orbis</Text>
        <Avatar
          src={user?.avatar || ""}
          fallback={user?.userName?.[0]?.toUpperCase() || "?"}
          size={40}
        />
      </View>

      {/* Bienvenida */}
      <Text style={styles.title}>¡Hola, {user?.userName}! 👋</Text>
      <Text style={styles.subtitle}>
        Aquí tienes un resumen de tus próximos viajes y recomendaciones.
      </Text>

      {/* Próximos Viajes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximos Viajes</Text>
        {upcomingTrips.map((trip) => (
          <Card key={trip.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.cardTitle}>
                  <Ionicons name="location-outline" size={16} color="#2563EB" />{" "}
                  {trip.destination}
                </Text>
                <Text style={styles.cardText}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />{" "}
                  {trip.date} • {trip.airline}
                </Text>
              </View>
              <Badge
                label={
                  trip.status === "confirmed" ? "Confirmado" : "Pendiente"
                }
                variant={trip.status === "confirmed" ? "default" : "secondary"}
              />
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.progressLabel}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#16A34A"
                />{" "}
                Salud
              </Text>
              <Progress value={trip.healthScore} color="#16A34A" />
              <Text style={styles.progressDesc}>
                {trip.healthScore}% preparado
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.progressLabel}>
                <Ionicons name="heart-outline" size={14} color="#DC2626" />{" "}
                Cultural
              </Text>
              <Progress value={trip.culturalScore} color="#DC2626" />
              <Text style={styles.progressDesc}>
                {trip.culturalScore}% preparado
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Alertas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <Text style={styles.cardTitle}>
              {alert.type === "health" && (
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#16A34A"
                />
              )}
              {alert.type === "cultural" && (
                <Ionicons name="heart-outline" size={14} color="#DC2626" />
              )}
              {alert.type !== "health" && alert.type !== "cultural" && (
                <MaterialIcons
                  name="warning-amber"
                  size={14}
                  color="#D97706"
                />
              )}{" "}
              {alert.title}
            </Text>
            <Text style={styles.cardText}>{alert.description}</Text>
            <Text style={styles.alertDate}>
              <Ionicons name="time-outline" size={12} color="#9CA3AF" />{" "}
              {alert.date}
            </Text>
          </Card>
        ))}
      </View>

      {/* Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu Perfil</Text>
        <Card>
          <View style={styles.row}>
            <Avatar
              src={user?.avatar || ""}
              fallback={user?.userName?.[0]?.toUpperCase() || "?"}
              size={48}
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>{user?.userName}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
          <Text>Rol: {user?.role}</Text>
        </Card>
      </View>

      {/* Botón de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6, color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginBottom: 20 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardText: { fontSize: 14, color: "#6B7280" },
  progressLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  progressDesc: { fontSize: 12, color: "#6B7280" },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  alertDate: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  profileName: { fontSize: 16, fontWeight: "bold" },
  profileEmail: { fontSize: 12, color: "#6B7280" },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 15,
  },
});