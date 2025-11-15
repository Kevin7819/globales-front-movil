import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
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

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
        <ActivityIndicator size="large" color="#93C5FD" />
        <Text style={styles.loadingText}>
          {loggingOut ? "Cerrando sesión..." : "Cargando tu experiencia de viaje..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Background decorative layers (clouds / planes) */}
      <Animated.View pointerEvents="none" style={[styles.clouds, { opacity: fadeAnim }]} />
      <Animated.View pointerEvents="none" style={[styles.clouds2, { opacity: fadeAnim }]} />
      <Animated.View pointerEvents="none" style={[styles.planes, { opacity: fadeAnim }]} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header con imagen y overlay glass */}
          <ImageBackground
            source={{
              uri:
                "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
            }}
            style={styles.headerBackground}
            imageStyle={styles.headerImage}
          >
            <View style={styles.headerOverlay}>
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.brandRow}>
                    <Feather name="globe" size={28} color="#BFDBFE" />
                    <Text style={styles.headerTitle}>ORBIS</Text>
                  </View>
                  <Text style={styles.headerSubtitle}>Airlines</Text>
                </View>

                <TouchableOpacity style={styles.avatarButton} onPress={() => router.push("/dashboard/edit-profile")}>
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
                <Text style={styles.welcomeSubtitle}>Tu próxima aventura te espera</Text>
              </View>
            </View>
          </ImageBackground>

          {/* Quick Actions (glass card background) */}
          <Card style={[styles.cardGlass, styles.quickActions]}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/map")}>
                <View style={[styles.actionIcon, { backgroundColor: "#0EA5E9" }]}>
                  <Ionicons name="map" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => router.push({ pathname: "/(tabs)/chat", params: { name: user?.name } })}>
                <View style={[styles.actionIcon, { backgroundColor: "#10B981" }]}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Asistente</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={handleAddTrip}>
                <View style={[styles.actionIcon, { backgroundColor: "#8B5CF6" }]}>
                  <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Nuevo Viaje</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard} onPress={() => router.push("/dashboard/edit-profile")}>
                <View style={[styles.actionIcon, { backgroundColor: "#F59E0B" }]}>
                  <Ionicons name="person" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionText}>Mi Perfil</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Próximos Viajes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Viajes</Text>
              <TouchableOpacity style={styles.seeAllButton} onPress={handleAddTrip}>
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Ionicons name="chevron-forward" size={16} color="#93C5FD" />
              </TouchableOpacity>
            </View>

            {upcomingTrips.length === 0 ? (
              <Card style={[styles.emptyCard, styles.cardGlass]}>
                <View style={styles.emptyContent}>
                  <Ionicons name="airplane-outline" size={48} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>No tienes viajes programados</Text>
                  <Text style={styles.emptyMessage}>
                    Comienza a planificar tu próxima aventura con Orbis Airlines
                  </Text>
                  <TouchableOpacity style={styles.primaryButton} onPress={handleAddTrip}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Agregar Viaje</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripsScroll} contentContainerStyle={styles.tripsContainer}>
                {upcomingTrips.map((trip, index) => {
                  const tripStatus = getDaysUntilTrip(trip.departureDate);
                  return (
                    <Card key={trip.tripId} style={[styles.tripCard, styles.cardGlass]}>
                      <View style={styles.tripHeader}>
                        <View style={styles.flightInfo}>
                          <Text style={styles.destination}>{trip.destination}</Text>
                          {trip.flightNumber && <Text style={styles.flightNumber}>Vuelo {trip.flightNumber}</Text>}
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

                      <TouchableOpacity
                        style={styles.tripButton}
                        onPress={async () => {
                          try {
                            await AsyncStorage.setItem("openTripId", String(trip.tripId));
                          } catch (e) {
                            console.warn("No se pudo guardar openTripId", e);
                          }
                          router.push("/trips");
                        }}
                      >
                        <Text style={styles.tripButtonText}>Ver Detalles</Text>
                        <Ionicons name="arrow-forward" size={16} color="#93C5FD" />
                      </TouchableOpacity>
                    </Card>
                  );
                })}
              </ScrollView>
            )}
          </View>

          {/* Información del Viajero */}
          <Card style={[styles.travelerCard, styles.cardGlass]}>
            <View style={styles.travelerHeader}>
              <Ionicons name="ribbon" size={24} color="#93C5FD" />
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
                      <Text style={styles.statNumber}>{new Set(upcomingTrips.map((t) => t.destination)).size}</Text>
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

              <TouchableOpacity style={styles.editProfileButton} onPress={() => router.push("/dashboard/edit-profile")}>
                <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                <Text style={styles.editProfileText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Servicios Orbis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servicios Orbis</Text>
            <View style={styles.servicesGrid}>
              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="airplane" size={22} color="#93C5FD" />
                </View>
                <Text style={styles.serviceText}>Viajes</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.serviceCard}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="map" size={22} color="#93C5FD" />
                </View>
                <Text style={styles.serviceText}>Mapas</Text>
              </TouchableOpacity>

              <View style={[styles.serviceCard, { opacity: 0.6 }]}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="book-outline" size={22} color="#93C5FD" />
                </View>
                <Text style={styles.serviceText}>Guías (Próx.)</Text>
              </View>

              <View style={[styles.serviceCard, { opacity: 0.6 }]}>
                <View style={styles.serviceIcon}>
                  <Ionicons name="time-outline" size={22} color="#93C5FD" />
                </View>
                <Text style={styles.serviceText}>Próximamente</Text>
              </View>
            </View>

            <Text style={styles.smallNote}>
              Algunas funciones como las guías estarán disponibles más adelante.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#93C5FD" />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>Orbis Airlines © 2024</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0A0F29", // match register bg
    alignItems: "center",
    justifyContent: "flex-start",
  },

  // decorative layers (transparent shapes) to mimic register visuals
  clouds: {
    position: "absolute",
    width: "200%",
    height: "40%",
    top: -20,
    backgroundColor: "transparent",
    zIndex: 0,
  },
  clouds2: {
    position: "absolute",
    width: "200%",
    height: "40%",
    top: 100,
    backgroundColor: "transparent",
    zIndex: 0,
  },
  planes: {
    position: "absolute",
    top: 60,
    left: -100,
    width: 600,
    height: 600,
    backgroundColor: "transparent",
    borderRadius: 300,
    zIndex: 0,
  },

  container: {
    flex: 1,
    width: "100%",
    maxWidth: 920,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A0F29",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#A5B4FC",
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
    backgroundColor: "rgba(2, 56, 89, 0.85)",
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E0EAFF",
    letterSpacing: 2,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#A5B4FC",
    fontWeight: "300",
    marginTop: -2,
  },

  avatarButton: {
    borderRadius: 21,
    overflow: "hidden",
  },
  avatar: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },

  welcomeSection: {
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: "#E0EAFF",
    fontWeight: "300",
  },
  userName: {
    fontSize: 28,
    color: "#E0EAFF",
    fontWeight: "700",
    marginTop: 2,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#CBD5E1",
    fontWeight: "300",
    marginTop: 4,
  },

  // glass card base used across
  cardGlass: {
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    marginHorizontal: 20,
    marginTop: 10,
    zIndex: 2,
  },

  quickActions: {
    marginTop: 12,
    paddingVertical: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0EAFF",
    marginBottom: 12,
  },

  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  actionCard: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CBD5E1",
    textAlign: "center",
  },

  section: {
    marginTop: 36,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#93C5FD",
    fontWeight: "600",
    marginRight: 6,
  },

  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderStyle: "dashed",
    backgroundColor: "transparent",
    marginHorizontal: 20,
  },
  emptyContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E0EAFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#A5B4FC",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#93C5FD",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#0A0F29",
    fontWeight: "700",
    fontSize: 14,
  },

  tripsScroll: {
    marginHorizontal: -10,
  },
  tripsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  tripCard: {
    width: width * 0.75,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "transparent",
    marginRight: 16,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  flightInfo: {
    flex: 1,
  },
  destination: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0EAFF",
    marginBottom: 4,
  },
  flightNumber: {
    fontSize: 12,
    color: "#A5B4FC",
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  tripDetails: {
    marginBottom: 12,
  },
  dateSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#CBD5E1",
    fontWeight: "500",
  },
  reservationSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reservationLabel: {
    fontSize: 12,
    color: "#A5B4FC",
  },
  reservationCode: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#E0EAFF",
  },
  tripButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.04)",
  },
  tripButtonText: {
    fontSize: 14,
    color: "#93C5FD",
    fontWeight: "600",
    marginRight: 6,
  },

  travelerCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  travelerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  travelerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0EAFF",
  },
  travelerContent: {
    gap: 12,
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
    marginLeft: 14,
  },
  travelerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E0EAFF",
    marginBottom: 2,
  },
  travelerEmail: {
    fontSize: 14,
    color: "#A5B4FC",
    marginBottom: 8,
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
    color: "#93C5FD",
  },
  statLabel: {
    fontSize: 12,
    color: "#A5B4FC",
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
    color: "#CBD5E1",
  },

  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 24,
  },
  serviceCard: {
    alignItems: "center",
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CBD5E1",
    textAlign: "center",
  },

  smallNote: {
    fontSize: 12,
    color: "#A5B4FC",
    textAlign: "center",
    marginTop: 14,
    fontStyle: "italic",
  },

  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#93C5FD",
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  editProfileText: {
    color: "#0A0F29",
    fontWeight: "700",
    fontSize: 14,
  },

  footer: {
    padding: 20,
    alignItems: "center",
    marginTop: 8,
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
    color: "#A5B4FC",
    fontWeight: "500",
  },
  footerText: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
