import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Card } from "../../components/ui/Card";
import { tripService } from "../../services/TripApi";
import { userService } from "../../services/UserApi";
import type { Trip, User } from "../../types";

const { width } = Dimensions.get("window");

const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export default function TripsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para el modal de reclamar viaje
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [reservationCode, setReservationCode] = useState("");
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState("");

  // Cargar usuario
  useEffect(() => {
    async function fetchUser() {
      try {
        const savedUserId = await AsyncStorage.getItem("userId");
        if (!savedUserId) {
          router.replace("/auth/login");
          return;
        }

        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Error cargando usuario:", err);
        setError("Error al cargar usuario");
      }
    }
    fetchUser();
  }, []);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tripService.getUserTrips();
      setTrips(data || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("No autorizado. Inicia sesión nuevamente.");
      } else {
        setError("Error al obtener los viajes.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Datos a mostrar
  const stats = {
    upcomingTrips: trips.filter(trip => new Date(trip.departureDate) > new Date()).length,
    completedTrips: trips.filter(trip => new Date(trip.departureDate) < new Date()).length,
    uniqueDestinations: new Set(trips.map(trip => trip.destination)).size,
    nextTrip: trips
      .filter(trip => new Date(trip.departureDate) > new Date())
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())[0],
    tripsByType: {
      business: trips.filter(trip => trip.type?.toLowerCase() === 'business').length,
      leisure: trips.filter(trip => trip.type?.toLowerCase() === 'leisure').length,
      family: trips.filter(trip => trip.type?.toLowerCase() === 'family').length,
      other: trips.filter(trip => !['business', 'leisure', 'family'].includes(trip.type?.toLowerCase())).length
    },
    thisMonthTrips: trips.filter(trip => {
      const tripDate = new Date(trip.departureDate);
      const now = new Date();
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    }).length,
    revisitRate: (() => {
      const completed = trips.filter(trip => new Date(trip.departureDate) < new Date()).length;
      const unique = new Set(trips.map(trip => trip.destination)).size;
      return completed > 0 ? Math.round(((completed - unique) / completed) * 100) : 0;
    })()
  };

  const getTripStatusColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'business': return { bg: '#FEF7FF', text: '#8B5CF6' };
      case 'leisure': return { bg: '#F0FDF4', text: '#25D9C7' };
      case 'family': return { bg: '#EFF6FF', text: '#05A6A6' };
      default: return { bg: '#E6FBFA', text: '#64748B' };
    }
  };

  const getDaysUntilTrip = (departureDate: string) => {
    const today = new Date();
    const departure = new Date(departureDate);
    const diffTime = departure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: "Completado", color: "#25D9C7", bg: "#F0FDF4" };
    if (diffDays === 0) return { text: "Hoy", color: "#023859", bg: "#E6FBFA" };
    if (diffDays === 1) return { text: "Mañana", color: "#03A696", bg: "#FFF7ED" };
    if (diffDays <= 7) return { text: `En ${diffDays} días`, color: "#25D9C7", bg: "#FFFBEB" };
    return { text: `En ${diffDays} días`, color: "#05A6A6", bg: "#EFF6FF" };
  };

  const getMostCommonTripType = () => {
    const types = stats.tripsByType;
    if (types.business >= types.leisure && types.business >= types.family && types.business >= types.other) 
      return { type: "Negocios", count: types.business };
    if (types.leisure >= types.family && types.leisure >= types.other) 
      return { type: "Placer", count: types.leisure };
    if (types.family >= types.other) 
      return { type: "Familia", count: types.family };
    return { type: "Otros", count: types.other };
  };

  const handleTripClick = async (trip: Trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };

  // Funciones para el modal de reclamar viaje
  const handleOpenClaimModal = () => {
    setIsClaimModalOpen(true);
  };

  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false);
    setReservationCode("");
    setClaimError("");
  };

  const handleClaimTrip = async () => {
    if (!reservationCode.trim()) {
      setClaimError("Por favor ingresa un código de reserva");
      return;
    }

    setClaimLoading(true);
    setClaimError("");

    try {
      await tripService.claimTripByReservationCode(reservationCode.trim());
      handleCloseClaimModal();
      fetchTrips();
      Alert.alert("Éxito", "Viaje reclamado correctamente");
    } catch (err: any) {
      setClaimError(err.response?.data?.message || "Error al reclamar el viaje. Verifica el código.");
    } finally {
      setClaimLoading(false);
    }
  };

  const mostCommonType = getMostCommonTripType();

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#05A6A6" />
        <Text style={styles.loadingText}>Cargando tus viajes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.headerSubtitle}>Mis Viajes</Text>
              </View>
            </View>

            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Gestiona tus viajes</Text>
              <Text style={styles.userName}>con Orbis Airlines</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Resumen de Viajes</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContainer}
          >
            {/* Total de Viajes */}
            <View style={[styles.statCard, styles.primaryCard]}>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Total de Viajes</Text>
                  <Text style={styles.statValue}>{trips.length}</Text>
                  <Text style={styles.statSubtext}>
                    {stats.thisMonthTrips} este mes
                  </Text>
                </View>
                <Ionicons name="airplane" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {/* Próximos Viajes */}
            <View style={[styles.statCard, styles.successCard]}>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Próximos Viajes</Text>
                  <Text style={styles.statValue}>{stats.upcomingTrips}</Text>
                  <Text style={styles.statSubtext}>
                    {stats.nextTrip ? `Próximo: ${formatDate(stats.nextTrip.departureDate)}` : 'Sin viajes'}
                  </Text>
                </View>
                <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {/* Viajes Completados */}
            <View style={[styles.statCard, styles.warningCard]}>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Completados</Text>
                  <Text style={styles.statValue}>{stats.completedTrips}</Text>
                  <Text style={styles.statSubtext}>
                    {stats.revisitRate > 0 ? `${stats.revisitRate}% re-visitas` : 'Viajes únicos'}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>

            {/* Destinos Únicos */}
            <View style={[styles.statCard, styles.infoCard]}>
              <View style={styles.statContent}>
                <View>
                  <Text style={styles.statLabel}>Destinos Únicos</Text>
                  <Text style={styles.statValue}>{stats.uniqueDestinations}</Text>
                  <Text style={styles.statSubtext}>
                    {mostCommonType.count > 0
                      ? `Favorito: ${mostCommonType.type}`
                      : 'Sin preferencias'}
                  </Text>
                </View>
                <Ionicons name="globe" size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Acción Principal */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryActionButton}
            onPress={handleOpenClaimModal}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Reclamar Nuevo Viaje</Text>
              <Text style={styles.actionSubtitle}>Usa tu código de reserva</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {error && !loading && (
          <Card style={styles.errorCard}>
            <View style={styles.errorContent}>
              <View style={styles.errorIcon}>
                <Ionicons name="warning" size={32} color="#023859" />
              </View>
              <Text style={styles.errorTitle}>Error al cargar viajes</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchTrips}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="airplane-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No tienes viajes programados</Text>
              <Text style={styles.emptyMessage}>
                Usa tu código de reserva para reclamar tu viaje y comenzar a planificar tu próxima aventura con Orbis Airlines.
              </Text>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleOpenClaimModal}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Reclamar Mi Viaje</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Lista de Viajes */}
        {!loading && !error && trips.length > 0 && (
          <View style={styles.tripsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tus Viajes</Text>
              <Text style={styles.tripsCount}>{trips.length} viajes</Text>
            </View>
            
            <View style={styles.tripsList}>
              {trips.map((trip) => {
                const tripStatus = getDaysUntilTrip(trip.departureDate);
                const typeColors = getTripStatusColor(trip.type);
                
                return (
                  <TouchableOpacity 
                    key={trip.tripId}
                    onPress={() => handleTripClick(trip)}
                    style={styles.tripCard}
                  >
                    <View style={styles.tripHeader}>
                      <View style={styles.destinationInfo}>
                        <View style={styles.destinationIcon}>
                          <Ionicons name="location" size={20} color="#05A6A6" />
                        </View>
                        <View>
                          <Text style={styles.destinationText}>{trip.destination}</Text>
                          <View style={[styles.typeBadge, { backgroundColor: typeColors.bg }]}>
                            <Text style={[styles.badgeText, { color: typeColors.text }]}>
                              {capitalizeFirstLetter(trip.type)}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: tripStatus.bg }]}>
                        <Text style={[styles.statusText, { color: tripStatus.color }]}>
                          {tripStatus.text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.tripDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="calendar" size={16} color="#64748B" />
                        <Text style={styles.detailText}>
                          {formatDate(trip.departureDate)}
                        </Text>
                      </View>

                      {trip.flightNumber && (
                        <View style={styles.detailRow}>
                          <Ionicons name="airplane" size={16} color="#64748B" />
                          <Text style={styles.detailText}>Vuelo {trip.flightNumber}</Text>
                        </View>
                      )}

                      <View style={styles.reservationRow}>
                        <Text style={styles.reservationLabel}>Código de Reserva</Text>
                        <Text style={styles.reservationCode}>{trip.reservationCode}</Text>
                      </View>
                    </View>

                    <View style={styles.tripFooter}>
                      <Text style={styles.viewDetailsText}>Ver detalles</Text>
                      <Ionicons name="chevron-forward" size={16} color="#05A6A6" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Trip Details Modal */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIcon}>
                  <Ionicons name="location" size={24} color="#05A6A6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{selectedTrip?.destination}</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedTrip && capitalizeFirstLetter(selectedTrip.type)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Información del Vuelo</Text>
                
                <View style={styles.modalRow}>
                  <View style={styles.modalLabelContainer}>
                    <Ionicons name="calendar" size={16} color="#64748B" />
                    <Text style={styles.modalLabel}>Fecha de Salida</Text>
                  </View>
                  <Text style={styles.modalValue}>
                    {selectedTrip && formatLongDate(selectedTrip.departureDate)}
                  </Text>
                </View>

                {selectedTrip?.flightNumber && (
                  <View style={styles.modalRow}>
                    <View style={styles.modalLabelContainer}>
                      <Ionicons name="airplane" size={16} color="#64748B" />
                      <Text style={styles.modalLabel}>Número de Vuelo</Text>
                    </View>
                    <Text style={styles.modalValue}>{selectedTrip.flightNumber}</Text>
                  </View>
                )}

                <View style={styles.modalRow}>
                  <View style={styles.modalLabelContainer}>
                    <Ionicons name="key" size={16} color="#64748B" />
                    <Text style={styles.modalLabel}>Código de Reserva</Text>
                  </View>
                  <Text style={styles.reservationCodeModal}>{selectedTrip?.reservationCode}</Text>
                </View>

                <View style={styles.modalRow}>
                  <View style={styles.modalLabelContainer}>
                    <Ionicons name="time" size={16} color="#64748B" />
                    <Text style={styles.modalLabel}>Estado</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    selectedTrip && { backgroundColor: getDaysUntilTrip(selectedTrip.departureDate).bg }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      selectedTrip && { color: getDaysUntilTrip(selectedTrip.departureDate).color }
                    ]}>
                      {selectedTrip && getDaysUntilTrip(selectedTrip.departureDate).text}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.secondaryButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Claim Trip Modal */}
      <Modal
        visible={isClaimModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseClaimModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <View style={styles.modalIcon}>
                  <Ionicons name="key" size={24} color="#05A6A6" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Reclamar Viaje</Text>
                  <Text style={styles.modalSubtitle}>Ingresa tu código de reserva</Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={handleCloseClaimModal}
                disabled={claimLoading}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Código de Reserva</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: ABC123XYZ"
                  placeholderTextColor="#9CA3AF"
                  value={reservationCode}
                  onChangeText={(text) => {
                    setReservationCode(text.toUpperCase());
                    setClaimError("");
                  }}
                  autoCapitalize="characters"
                  autoFocus
                  editable={!claimLoading}
                />
                <Text style={styles.inputHelp}>
                  Encuentra este código en tu confirmación de reserva o email de la aerolínea
                </Text>
              </View>

              {claimError && (
                <View style={styles.errorBox}>
                  <Ionicons name="warning" size={16} color="#023859" />
                  <Text style={styles.errorText}>{claimError}</Text>
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    claimLoading || !reservationCode.trim() ? styles.disabledButton : null
                  ]}
                  onPress={handleClaimTrip}
                  disabled={claimLoading || !reservationCode.trim()}
                >
                  {claimLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="add" size={20} color="#fff" />
                  )}
                  <Text style={styles.primaryButtonText}>
                    {claimLoading ? "Reclamando..." : "Reclamar Viaje"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCloseClaimModal}
                  disabled={claimLoading}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
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
  // Header Styles
  headerBackground: {
    height: 180,
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
    marginBottom: 20,
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
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "300",
    marginTop: 4,
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
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 2,
  },
  // Stats Section
  statsSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  statsScroll: {
    marginHorizontal: -20,
  },
  statsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {     
    width: width * 0.5,
    borderRadius: 16,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryCard: {
    backgroundColor: "#05A6A6",
  },
  successCard: {
    backgroundColor: "#25D9C7",
  },
  warningCard: {
    backgroundColor: "#03A696",
  },
  infoCard: {
    backgroundColor: "#05A6A6",
  },
  statContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },
  statSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  // Action Section
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  primaryActionButton: {
    backgroundColor: "#05A6A6",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  // Error State
  errorCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: "#E6FBFA",
    borderWidth: 1,
    borderColor: "#25D9C7",
  },
  errorContent: {
    padding: 24,
    alignItems: "center",
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#023859",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#023859",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#023859",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Empty State
  emptyCard: {
    margin: 20,
    borderRadius: 16,
    backgroundColor: "#E6FBFA",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyContent: {
    padding: 32,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#475569",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#05A6A6",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  // Trips Section
  tripsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tripsCount: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  tripsList: {
    gap: 12,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#D1E9E9",
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  destinationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#25D9C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destinationText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tripDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  reservationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#D1E9E9",
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
  tripFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#D1E9E9",
  },
  viewDetailsText: {
    fontSize: 14,
    color: "#05A6A6",
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#D1E9E9",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  modalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#25D9C7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  modalSection: {
    gap: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#D1E9E9",
  },
  modalLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  modalLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  modalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0F172A",
    textAlign: "right",
    flex: 1,
  },
  reservationCodeModal: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#05A6A6",
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#D1E9E9",
  },
  secondaryButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: "monospace",
    textTransform: "uppercase",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  inputHelp: {
    fontSize: 12,
    color: "#6B7280",
  },
  errorBox: {
    backgroundColor: "#E6FBFA",
    borderWidth: 1,
    borderColor: "#25D9C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: "#023859",
    fontSize: 14,
    flex: 1,
  },
  modalActions: {
    gap: 12,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
});