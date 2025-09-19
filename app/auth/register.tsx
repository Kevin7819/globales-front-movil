import { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { Progress } from "../../components/ui/Progress";

export default function DashboardScreen() {
  const router = useRouter();

  const [user] = useState({
    name: "Juan Pérez",
    email: "juan@email.com",
    country: "México",
    travelType: "Negocios",
    avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  });

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
      title: "Costumbres importantes en Tokio",
      description: "Evita señalar con el dedo y quítate los zapatos en interiores",
      date: "Hace 1 día",
    },
  ]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="globe-outline" size={24} color="#2563EB" />
          <Text style={styles.brand}>Se tiene que pensar</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <Avatar src={user.avatar} fallback="JP" size={36} />
        </View>
      </View>

      {/* Welcome */}
      <Text style={styles.welcome}>¡Hola, {user.name}! 👋</Text>
      <Text style={styles.subtitle}>
        Aquí tienes un resumen de tus próximos viajes y recomendaciones personalizadas.
      </Text>

      {/* Próximos Viajes */}
      <View style={{ marginTop: 24 }}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Viajes</Text>
          <Button
            title="Nuevo Viaje"
            variant="outline"
            onPress={() => router.push("/trips/new")}
          />
        </View>

        {upcomingTrips.map((trip) => (
          <View key={trip.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{trip.destination}</Text>
                <Text style={styles.cardDesc}>
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" /> {trip.date} • {trip.airline}
                </Text>
              </View>
              <Badge
                label={trip.status === "confirmed" ? "Confirmado" : "Pendiente"}
                variant={trip.status === "confirmed" ? "success" : "secondary"}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 16, marginTop: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.metricLabel}>Salud</Text>
                <Progress value={trip.healthScore} />
                <Text style={styles.metricHint}>{trip.healthScore}% preparado</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.metricLabel}>Cultural</Text>
                <Progress value={trip.culturalScore} />
                <Text style={styles.metricHint}>{trip.culturalScore}% preparado</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
              <Button
                title="Ver en Mapa"
                size="sm"
                onPress={() =>
                  router.push(`/map?destination=${encodeURIComponent(trip.destination)}`)
                }
              />
              <Button
                title="Detalles"
                size="sm"
                variant="outline"
                onPress={() => router.push(`/trips/${trip.id}`)}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Alertas */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Alertas Recientes</Text>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.alertItem}>
            {alert.type === "health" ? (
              <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
            ) : alert.type === "cultural" ? (
              <Ionicons name="heart-outline" size={16} color="#DC2626" />
            ) : (
              <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDesc}>{alert.description}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                <Text style={styles.alertTime}>{alert.date}</Text>
              </View>
            </View>
          </View>
        ))}
        <Button
          title="Ver Todas"
          variant="outline"
          onPress={() => router.push("/alerts")}
          style={{ marginTop: 12 }}
        />
      </View>

      {/* Stats */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Países visitados</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Viajes este año</Text>
          <Text style={styles.statValue}>8</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Preparación promedio</Text>
          <Text style={styles.statValue}>87%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  brand: { fontSize: 18, fontWeight: "700", marginLeft: 8, color: "#111827" },
  welcome: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#111827" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  cardDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  metricLabel: { fontSize: 12, fontWeight: "500", marginBottom: 4, color: "#374151" },
  metricHint: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  alertItem: { flexDirection: "row", gap: 8, marginBottom: 12 },
  alertTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  alertDesc: { fontSize: 12, color: "#6B7280" },
  alertTime: { fontSize: 10, color: "#9CA3AF", marginLeft: 4 },
  statRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  statLabel: { fontSize: 14, color: "#6B7280" },
  statValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
});