import MapboxGL, { Camera, FillLayer, ShapeSource, UserLocation } from "@rnmapbox/maps";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getCountryBorders, getCountryIndicators } from "../../services/location";

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? "");

export default function MapScreen() {
  const router = useRouter();
  const { isoCode = "FRA" } = useLocalSearchParams<{ isoCode?: string }>();

  const [geoJson, setGeoJson] = useState<any>(null);
  const [indicators, setIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [location, setLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS === "android") {
          await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permiso de ubicación denegado");
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        setLocation([current.coords.longitude, current.coords.latitude]);
      } catch (err) {
        console.error("Error obteniendo ubicación:", err);
      }
    };

    requestPermissions();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const borders = await getCountryBorders(isoCode);
        const dataIndicators = await getCountryIndicators(isoCode);
        setGeoJson(borders);
        setIndicators(dataIndicators);
      } catch (err) {
        console.error("Error loading map data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isoCode]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/dashboard")}>
          <Text style={styles.backButton}>← Dashboard</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mapa Interactivo</Text>
      </View>

      {/* Mapa arriba */}
      <TouchableOpacity style={styles.mapWrapper} onPress={() => setMapFullScreen(true)}>
        <MapboxGL.MapView style={styles.map}>
          <Camera
            zoomLevel={location ? 10 : 3}
            centerCoordinate={location ?? [2.3522, 48.8566]} // París por defecto
          />
          <UserLocation visible={true} />
          {geoJson && (
            <ShapeSource id="country" shape={geoJson}>
              <FillLayer id="country-fill" style={{ fillColor: "rgba(37, 99, 235, 0.3)" }} />
            </ShapeSource>
          )}
        </MapboxGL.MapView>
        <Text style={styles.tapHint}>Toca el mapa para agrandar</Text>
      </TouchableOpacity>

      {/* Info abajo scrollable */}
      <ScrollView style={styles.infoSection}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destino Actual</Text>
          <Text style={styles.cardSubtitle}>{indicators?.countryName ?? "Desconocido"}</Text>
          <Text style={styles.cardText}>Población: {indicators?.population?.toLocaleString() ?? "N/A"}</Text>
          <Text style={styles.cardText}>PIB per cápita: ${indicators?.gdpPerCapita ?? "N/A"}</Text>
          <Text style={styles.cardText}>Esperanza de vida: {indicators?.lifeExpectancy ?? "N/A"}</Text>
          <Text style={styles.cardText}>Gasto en salud: {indicators?.healthExpenditure ?? "N/A"}%</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Sanitaria</Text>
          <Text style={styles.cardText}>
            Mortalidad infantil: {indicators?.infantMortality ?? "N/A"} por 1,000 nacimientos
          </Text>
          <Text style={styles.cardText}>
            Médicos por 1,000 hab.: {indicators?.physiciansPerThousand ?? "N/A"}
          </Text>
        </View>
      </ScrollView>

      {/* Modal de mapa fullscreen */}
      <Modal visible={mapFullScreen} animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={() => setMapFullScreen(false)} style={styles.closeButton}>
            <Text style={styles.closeText}>✕ Cerrar</Text>
          </TouchableOpacity>
          <MapboxGL.MapView style={styles.map}>
            <Camera
              zoomLevel={location ? 12 : 4}
              centerCoordinate={location ?? [2.3522, 48.8566]}
            />
            <UserLocation visible={true} />
            {geoJson && (
              <ShapeSource id="country-full" shape={geoJson}>
                <FillLayer id="country-fill" style={{ fillColor: "rgba(37, 99, 235, 0.4)" }} />
              </ShapeSource>
            )}
          </MapboxGL.MapView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 8, fontSize: 14, color: "#374151" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: { color: "#2563EB", fontSize: 14, fontWeight: "600" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },

  mapWrapper: { height: 200, margin: 12, borderRadius: 10, overflow: "hidden" },
  map: { flex: 1 },
  tapHint: {
    position: "absolute",
    bottom: 8,
    right: 8,
    fontSize: 10,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 4,
    borderRadius: 6,
  },

  infoSection: { flex: 1, paddingHorizontal: 12 },
  card: {
    backgroundColor: "white",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  cardText: { fontSize: 12, color: "#374151", marginTop: 2 },

  modalContainer: { flex: 1, backgroundColor: "white" },
  closeButton: { padding: 12, alignSelf: "flex-end" },
  closeText: { color: "#EF4444", fontWeight: "bold", fontSize: 14 },
});
