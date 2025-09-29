import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Progress } from "../../components/ui/Progress";
import { Avatar } from "../../components/ui/Avatar";

export default function DashboardScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // 👉 datos mock porque backend no los da
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
      description: "Evita señalar con el dedo y quítate los zapatos en interiores",
      date: "Hace 1 día",
    },
  ]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Error cargando usuario:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 8 }}>Cargando dashboard...</Text>
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

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push(
                    `/map?destination=${encodeURIComponent(trip.destination)}`
                  )
                }
              >
                <Text style={styles.buttonText}>Ver en Mapa</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={() => router.push(`/trips/${trip.id}`)}
              >
                <Text style={[styles.buttonText, { color: "#2563EB" }]}>
                  Detalles
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickRow}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/map")}
          >
            <Ionicons name="location-outline" size={32} color="#2563EB" />
            <Text style={styles.quickTitle}>Explorar Destinos</Text>
            <Text style={styles.quickDesc}>
              Descubre información sobre cualquier país
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/chat")}
          >
            <Ionicons name="chatbubble-outline" size={32} color="#16A34A" />
            <Text style={styles.quickTitle}>Pregunta al Asistente</Text>
            <Text style={styles.quickDesc}>
              Resuelve dudas sobre tu viaje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/health")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={32}
              color="#DC2626"
            />
            <Text style={styles.quickTitle}>Chequeo de Salud</Text>
            <Text style={styles.quickDesc}>
              Verifica requisitos sanitarios
            </Text>
          </TouchableOpacity>
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", padding: 16 },
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
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#111827" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardText: { fontSize: 14, color: "#6B7280" },
  progressLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  progressDesc: { fontSize: 12, color: "#6B7280" },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  button: { flex: 1, backgroundColor: "#2563EB", padding: 10, borderRadius: 6, alignItems: "center" },
  buttonOutline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#2563EB" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  alertDate: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
  profileName: { fontSize: 16, fontWeight: "bold" },
  profileEmail: { fontSize: 12, color: "#6B7280" },
  quickRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  quickCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickTitle: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  quickDesc: { fontSize: 12, textAlign: "center", color: "#6B7280", marginTop: 4 },
});