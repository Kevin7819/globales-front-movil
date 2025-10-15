import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { UserApi } from "../../services/UserApi";

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);

  // Cargar usuario y viajes
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem("userId");
        if (!savedUserId) {
          router.replace("/auth/login");
          return;
        }

        const userData = await UserApi.getCurrentUser(Number(savedUserId));
        setUser(userData);

        const trips = await UserApi.getUserTrips();
        setUpcomingTrips(trips || []);
      } catch (err) {
        console.error("Error cargando usuario:", err);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (!window.confirm("¿Seguro que querés cerrar sesión?")) return;
    } else {
      const confirmNative = await new Promise((resolve) => {
        Alert.alert(
          "Cerrar sesión",
          "¿Seguro que querés cerrar sesión?",
          [
            { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
            { text: "Sí, salir", style: "destructive", onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
      });
      if (!confirmNative) return;
    }

    try {
      setLoggingOut(true);
      await AsyncStorage.multiRemove(["token", "userId", "role"]);
      router.replace("/auth/login");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
    } finally {
      setLoggingOut(false);
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

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌍 Orbis</Text>
        <Avatar src={user?.avatar || ""} fallback={user?.name?.[0]?.toUpperCase() || "?"} size={40} />
      </View>

      <Text style={styles.title}>¡Hola, {user?.name}! 👋</Text>
      <Text style={styles.subtitle}>
        Aquí tienes un resumen de tus próximos viajes y recomendaciones personalizadas.
      </Text>

      {/* Botón para ir al mapa */}
      <TouchableOpacity
        style={styles.mapButton}
        onPress={() => router.push("/map")}
      >
        <Text style={styles.mapButtonText}>Mapa</Text>
      </TouchableOpacity>

      {/* Sección de viajes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✈️ Próximos Viajes</Text>
        {upcomingTrips.length === 0 ? (
          <Text style={styles.emptyText}>No tienes viajes próximos.</Text>
        ) : (
          upcomingTrips.map((trip) => (
            <Card key={trip.tripId}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={styles.cardTitle}>
                    <Ionicons name="location-outline" size={16} color="#2563EB" />{" "}
                    {trip.destination}
                  </Text>
                  <Text style={styles.cardText}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />{" "}
                    {trip.departureDate}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>

      {/* Perfil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Tu Perfil</Text>
        <Card>
          <View style={styles.row}>
            <Avatar src={user?.avatar || ""} fallback={user?.name?.[0]?.toUpperCase() || "?"} size={48} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <Text style={styles.profileText}>País: {user?.countryOfOrigin}</Text>
              <Text style={styles.profileText}>Idioma: {user?.preferredLanguage}</Text>
            </View>
          </View>
        </Card>
      </View>

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
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 6, color: "#111827" },
  subtitle: { fontSize: 14, color: "#4B5563", marginBottom: 20 },
  mapButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  mapButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: "#111827" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardText: { fontSize: 14, color: "#6B7280" },
  row: { flexDirection: "row", alignItems: "center" },
  profileName: { fontSize: 16, fontWeight: "bold" },
  profileEmail: { fontSize: 12, color: "#6B7280" },
  profileText: { fontSize: 12, color: "#374151" },
  emptyText: { fontSize: 14, color: "#9CA3AF" },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 8,
    marginBottom: 30,
  },
  logoutText: { color: "#fff", fontWeight: "bold", marginLeft: 8, fontSize: 15 },
});
