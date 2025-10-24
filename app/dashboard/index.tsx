import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Avatar } from "../../components/ui/Avatar";
import { Card } from "../../components/ui/Card";
import { tripService } from "../../services/TripApi";
import { userService } from "../../services/UserApi";
import apiFetch from "../../services/api";

const { width } = Dimensions.get("window");

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

        const userData = await userService.getCurrentUser();
        setUser(userData);

        const trips = await tripService.getUserTrips();
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

  const handleAddTrip = () => {
    router.push("/trips");
  };

  // Acción para enviar notificación de prueba (usa token internamente)
  const handleSendTestPush = async () => {
    try {
      await apiFetch(
        "/notifications/send-test",
        {
          method: "POST",
          body: JSON.stringify({ message: "Hola desde Orbis 👋", data: { screen: "dashboard" } }),
        },
        true // requireAuth -> agrega Authorization si hay token
      );
      Alert.alert("Notificación", "Notificación de prueba enviada ✉️");
    } catch (e: any) {
      console.error("Error enviando notificación:", e);
      Alert.alert("Error", e?.message || "No se pudo enviar la notificación.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntilTrip = (departureDate: string) => {
    const today = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Completado", color: "#10B981" };
    if (diffDays === 0) return { text: "Hoy", color: "#023859" };
    if (diffDays === 1) return { text: "Mañana", color: "#03A696" };
    if (diffDays <= 7) return { text: `En ${diffDays} días`, color: "#25D9C7" };
    return { text: `En ${diffDays} días`, color: "#2563EB" };
  };

  if (loading || loggingOut) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#05A6A6" />
        <Text style={styles.loadingText}>
          {loggingOut ? "Cerrando sesión..." : "Cargando tu experiencia de viaje..."}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con gradiente */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80' }}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.logoContainer}>
                <Ionicons name="airplane" size={28} color="#FFFFFF" />
                <Text style={styles.headerTitle}>ORBIS</Text>
              </View>
              <Text style={styles.headerSubtitle}>Airlines</Text>
            </View>
            <TouchableOpacity style={styles.avatarButton}>
              <Avatar
                src={user?.avatar || ""}
                fallback={user?.name?.[0]?.toUpperCase() || "?"}
                size={42}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>¡Bienvenido a bordo,</Text>
            <Text style={styles.userName}>{user?.name}!</Text>
            <Text style={styles.welcomeSubtitle}>
              Tu próxima aventura te espera
            </Text>
            {/* botón movido a Acciones Rápidas para mayor visibilidad en web */}
          </View>
        </View>
      </ImageBackground>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push("/map")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#0EA5E9' }]}>
              <Ionicons name="map" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Mapa</Text>
          </TouchableOpacity>

          {/* Acción: Probar notificación */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleSendTestPush}
          >
            {Platform.OS === 'web' ? (
              // @ts-ignore
              <button
                onClick={() => handleSendTestPush()}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#05A6A6' }]}>
                  <Ionicons name="notifications" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Notificaciones</Text>
              </button>
            ) : (
              <>
                <View style={[styles.actionIcon, { backgroundColor: '#05A6A6' }]}>
                  <Ionicons name="notifications" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Notificaciones</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push({ pathname: "/(tabs)/chat", params: { name: user?.name } })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Asistente</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={handleAddTrip}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Nuevo Viaje</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push("/")}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionText}>Mi Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Próximos Viajes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximos Viajes</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={handleAddTrip}
          >
            <Text style={styles.seeAllText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={16} color="#05A6A6" />
          </TouchableOpacity>
        </View>

        {upcomingTrips.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="airplane-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No tienes viajes programados</Text>
              <Text style={styles.emptyMessage}>
                Comienza a planificar tu próxima aventura con Orbis Airlines
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAddTrip}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Agregar Viaje</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tripsScroll}
            contentContainerStyle={styles.tripsContainer}
          >
            {upcomingTrips.map((trip, index) => {
              const tripStatus = getDaysUntilTrip(trip.departureDate);
              return (
                <Card key={trip.tripId} style={styles.tripCard}>
                  <View style={styles.tripHeader}>
                    <View style={styles.flightInfo}>
                      <Text style={styles.destination}>{trip.destination}</Text>
                      {trip.flightNumber && (
                        <Text style={styles.flightNumber}>Vuelo {trip.flightNumber}</Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: tripStatus.color }]}>
                      <Text style={styles.statusText}>{tripStatus.text}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripDetails}>
                    <View style={styles.dateSection}>
                      <Ionicons name="calendar" size={16} color="#64748B" />
                      <Text style={styles.dateText}>{formatDate(trip.departureDate)}</Text>
                    </View>
                    
                    <View style={styles.reservationSection}>
                      <Text style={styles.reservationLabel}>Código de Reserva</Text>
                      <Text style={styles.reservationCode}>{trip.reservationCode}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.tripButton}>
                    <Text style={styles.tripButtonText}>Ver Detalles</Text>
                    <Ionicons name="arrow-forward" size={16} color="#05A6A6" />
                  </TouchableOpacity>
                </Card>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Información del Viajero */}
      <Card style={styles.travelerCard}>
        <View style={styles.travelerHeader}>
          <Ionicons name="ribbon" size={24} color="#05A6A6" />
          <Text style={styles.travelerTitle}>Tu Perfil de Viajero</Text>
        </View>
        
        <View style={styles.travelerContent}>
          <View style={styles.travelerInfo}>
            <Avatar
              src={user?.avatar || ""}
              fallback={user?.name?.[0]?.toUpperCase() || "?"}
              size={60}
              
            />
            <View style={styles.travelerDetails}>
              <Text style={styles.travelerName}>{user?.name}</Text>
              <Text style={styles.travelerEmail}>{user?.email}</Text>
              <View style={styles.travelerStats}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{upcomingTrips.length}</Text>
                  <Text style={styles.statLabel}>Viajes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>
                    {new Set(upcomingTrips.map(t => t.destination)).size}
                  </Text>
                  <Text style={styles.statLabel}>Destinos</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.travelerMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="flag" size={16} color="#64748B" />
              <Text style={styles.metaText}>{user?.countryOfOrigin || "No especificado"}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="language" size={16} color="#64748B" />
              <Text style={styles.metaText}>{user?.preferredLanguage || "No especificado"}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Servicios Orbis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios Orbis</Text>
        <View style={styles.servicesGrid}>

          {/* Viajes (activo) */}
          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Ionicons name="airplane" size={22} color="#05A6A6" />
            </View>
            <Text style={styles.serviceText}>Viajes</Text>
          </TouchableOpacity>

          {/* Mapas (activo) */}
          <TouchableOpacity style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Ionicons name="map" size={22} color="#05A6A6" />
            </View>
            <Text style={styles.serviceText}>Mapas</Text>
          </TouchableOpacity>

          {/* Guías (próximamente / deshabilitado) */}
          <View style={[styles.serviceCard, { opacity: 0.6 }]}>
            <View style={styles.serviceIcon}>
              <Ionicons name="book-outline" size={22} color="#05A6A6" />
            </View>
            <Text style={styles.serviceText}>Guías (Próx.)</Text>
          </View>

          {/* Otro placeholder opcional */}
          <View style={[styles.serviceCard, { opacity: 0.6 }]}>
            <View style={styles.serviceIcon}>
              <Ionicons name="time-outline" size={22} color="#05A6A6" />
            </View>
            <Text style={styles.serviceText}>Próximamente</Text>
          </View>

        </View>

        <Text style={{ 
          fontSize: 12, 
          color: '#64748B', 
          textAlign: 'center', 
          marginTop: 12, 
          fontStyle: 'italic' 
        }}>
          Algunas funciones como las guías estarán disponibles más adelante.
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#64748B" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
        <Text style={styles.footerText}>Orbis Airlines © 2024</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  headerBackground: {
    height: 220,
  },
  headerImage: {
    opacity: 0.9,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 56, 89, 0.85)',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "300",
    marginTop: -2,
  },
  avatarButton: {
    borderRadius: 21,
    overflow: "hidden",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  welcomeSection: {
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "300",
  },
  userName: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "300",
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionCard: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  smallButton: {
    backgroundColor: "#05A6A6",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#05A6A6",
    fontWeight: "600",
    marginRight: 2,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#05A6A6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  tripsScroll: {
    marginHorizontal: -20,
  },
  tripsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tripCard: {
    width: width * 0.75,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  flightInfo: {
    flex: 1,
  },
  destination: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  tripDetails: {
    marginBottom: 16,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  reservationSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reservationLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  reservationCode: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#0F172A",
  },
  tripButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  tripButtonText: {
    fontSize: 14,
    color: "#05A6A6",
    fontWeight: "600",
    marginRight: 4,
  },
  travelerCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  travelerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  travelerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  travelerContent: {
    gap: 16,
  },
  travelerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  travelerAvatar: {
    borderWidth: 3,
    borderColor: "#25D9C7",
  },
  travelerDetails: {
    flex: 1,
    marginLeft: 16,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  travelerEmail: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  travelerStats: {
    flexDirection: "row",
    gap: 20,
  },
  stat: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#05A6A6",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  travelerMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: "#475569",
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceCard: {
    alignItems: "center",
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  footer: {
    padding: 20,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});