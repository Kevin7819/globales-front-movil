import MapboxGL, {
  Camera,
  CircleLayer,
  FillLayer,
  ShapeSource,
  SymbolLayer,
  UserLocation
} from '@rnmapbox/maps';
import Constants from "expo-constants";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { locationService } from "../../services/LocationApi";
import { mapDataService } from "../../services/mapDataApi";
import { tripService } from "../../services/TripApi";
import { MapData, Trip } from "../../types";

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? "");

// Coordenadas por defecto (Centroamérica)
const DEFAULT_COORD: [number, number] = [-84.0907, 9.7489];

export default function MapScreen() {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoading, setMapLoading] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [dataSource, setDataSource] = useState<'borders' | 'ai'>('ai');
  const [selectedCategory, setSelectedCategory] = useState<'salud' | 'seguridad' | 'cultura'>('salud');
  
  const hasLoadedGeoJson = useRef(false);

  const [nearestTrip, setNearestTrip] = useState<Trip | null>(null);
  const [tripError, setTripError] = useState<string | null>(null);
  const [hasTrips, setHasTrips] = useState(true);

  useEffect(() => {
    loadNearestTrip();
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
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

  const loadNearestTrip = async () => {
    try {
      setLoading(true);
      const trip = await tripService.getNearestTrip();
      setNearestTrip(trip);
      setHasTrips(true);
      console.log("Trip data:", {
        destination: trip.destination,
        countryCode: trip.countryCode,
        latitude: trip.latitude,
        longitude: trip.longitude
      });
    } catch (err: any) {
      setTripError(err.message);
      setHasTrips(false);
      console.error("Error loading nearest trip:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función simplificada para obtener el código de país
  const getCurrentCountryCode = (): string => {
    if (!nearestTrip) {
      console.log("No hay viaje, usando código por defecto: CRI");
      return "CRI";
    }

    const countryCode = nearestTrip.countryCode?.trim().toUpperCase();
    
    // Verificar si el código de país es válido (no vacío y tiene al menos 2 caracteres)
    if (!countryCode || countryCode.length < 2) {
      console.warn("Código de país inválido o vacío en el viaje:", nearestTrip.countryCode);
      console.log("Usando código por defecto: CRI");
      return "CRI";
    }

    console.log("Usando código de país del viaje:", countryCode);
    return countryCode;
  };

  useEffect(() => {
    const loadMapData = async () => {
      if (hasLoadedGeoJson.current && dataSource === 'borders') return;
      
      setMapLoading(true);
      const loadId = Math.random().toString(36).substring(2, 8);
      const countryCode = getCurrentCountryCode();
      
      console.log(`[${loadId}] Cargando datos desde: ${dataSource}, categoría: ${selectedCategory}, país: ${countryCode}`);

      try {
        let mapData: MapData | null = null;

        if (dataSource === 'borders') {
          hasLoadedGeoJson.current = true;
          mapData = await locationService.getCountryBorders(countryCode);
          console.log(`[${loadId}] Fronteras cargadas para ${countryCode}:`, mapData ? "GeoJSON válido" : "Sin datos");
        } else {
          switch (selectedCategory) {
            case 'salud':
              mapData = await mapDataService.getMapDataSalud(countryCode);
              break;
            case 'seguridad':
              mapData = await  mapDataService.getMapDataSeguridad(countryCode);
              break;
            case 'cultura':
              mapData = await  mapDataService.getMapDataCultura(countryCode); 
              break;
          }
          console.log(`[${loadId}] AI ${selectedCategory} cargado para ${countryCode}:`, mapData ? "Datos recibidos" : "Sin datos");
        }

        if (!mapData) {
          console.warn(`[${loadId}] Respuesta vacía del servidor`);
          setGeoJson(null);
          return;
        }

        let processedGeoJson = null;
        
        if (mapData.type === "FeatureCollection") {
          processedGeoJson = mapData;
        } else if (mapData?.GeoJson?.type === "FeatureCollection") {
          processedGeoJson = mapData.GeoJson;
        } else if (mapData?.geoJson?.type === "FeatureCollection") {
          processedGeoJson = mapData.geoJson;
        } else if (mapData?.features) {
          processedGeoJson = { type: "FeatureCollection", features: mapData.features };
        } else if (mapData?.locations) {
          processedGeoJson = {
            type: "FeatureCollection",
            features: mapData.locations.map((location: any) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [location.longitude, location.latitude]
              },
              properties: location
            }))
          };
        }

        if (processedGeoJson) {
          setGeoJson(processedGeoJson);
          console.log(`[${loadId}] ${dataSource.toUpperCase()} data establecida (${processedGeoJson.features?.length || 0} features)`);
        } else {
          console.warn(`[${loadId}] Formato inesperado:`, mapData);
          setGeoJson(null);
        }

      } catch (err: any) {
        console.error(`[${loadId}] Error cargando ${dataSource}:`, err.message);
        setGeoJson(null);
      } finally {
        setMapLoading(false);
      }
    };

    if (!loading) {
      loadMapData();
    }
  }, [dataSource, selectedCategory, loading]);

  useEffect(() => {
    if (geoJson && dataSource === 'ai' && geoJson.features?.length > 0) {
      const firstFeature = geoJson.features[0];
      if (firstFeature.geometry?.coordinates) {
        const coordinates = firstFeature.geometry.coordinates;
        console.log("Centrando en:", coordinates, "-", firstFeature.properties?.name);
        
        cameraRef.current?.setCamera({
          centerCoordinate: coordinates,
          zoomLevel: 13,
          animationDuration: 1000,
        });
      }
    }
  }, [geoJson, dataSource]);

  // Centrar en el viaje si tiene coordenadas
  useEffect(() => {
    if (nearestTrip && nearestTrip.latitude && nearestTrip.longitude) {
      const tripCoordinates: [number, number] = [nearestTrip.longitude, nearestTrip.latitude];
      console.log("Centrando en viaje:", tripCoordinates);
      
      cameraRef.current?.setCamera({
        centerCoordinate: tripCoordinates,
        zoomLevel: 10,
        animationDuration: 1500,
      });
    }
  }, [nearestTrip]);

  const zoomIn = () => {
    const newZoom = Math.min(zoomLevel + 1, 20);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoomLevel - 1, 1);
    setZoomLevel(newZoom);
    cameraRef.current?.setCamera({
      zoomLevel: newZoom,
      animationDuration: 300,
    });
  };

  const centerOnUser = () => {
    if (location) {
      cameraRef.current?.setCamera({
        centerCoordinate: location,
        zoomLevel: 14,
        animationDuration: 500,
      });
    }
  };

  const centerOnTrip = () => {
    if (nearestTrip && nearestTrip.latitude && nearestTrip.longitude) {
      const tripCoordinates: [number, number] = [nearestTrip.longitude, nearestTrip.latitude];
      cameraRef.current?.setCamera({
        centerCoordinate: tripCoordinates,
        zoomLevel: 10,
        animationDuration: 1000,
      });
    } else if (location) {
      centerOnUser();
    }
  };

  const toggleDataSource = () => {
    const newDataSource = dataSource === 'borders' ? 'ai' : 'borders';
    setDataSource(newDataSource);
    console.log(`Cambiando a modo: ${newDataSource}`);
  };

  const getCategoryColor = () => {
    switch (selectedCategory) {
      case 'salud':
        return { 
          circle: "#EF4444",
          dark: "#DC2626",
          pulse: "#FCA5A5",
          light: "#FEE2E2",
          icon: "local-hospital"
        };
      case 'seguridad':
        return { 
          circle: "#3B82F6",
          dark: "#1D4ED8",
          pulse: "#93C5FD",
          light: "#EFF6FF",
          icon: "security"
        };
      case 'cultura':
        return { 
          circle: "#10B981",
          dark: "#047857",
          pulse: "#6EE7B7",
          light: "#ECFDF5",
          icon: "museum"
        };
      default:
        return { 
          circle: "#2563EB",
          dark: "#1D4ED8",
          pulse: "#93C5FD",
          light: "#EFF6FF",
          icon: "place"
        };
    }
  };

  const baseColors = getCategoryColor();

  // Estado de carga principal
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando tu próximo viaje...</Text>
      </View>
    );
  }

  if (!hasTrips) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="travel-explore" size={64} color="#6B7280" />
        <Text style={styles.noTripsTitle}>No tienes viajes programados</Text>
        <Text style={styles.noTripsText}>
          Crea un nuevo viaje para ver recomendaciones personalizadas
        </Text>
        <TouchableOpacity style={styles.createTripButton} onPress={loadNearestTrip}>
          <Text style={styles.createTripButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con información del viaje */}
      {nearestTrip && (
        <View style={styles.tripHeader}>
          <MaterialIcons name="flight" size={16} color="#374151" />
          <Text style={styles.tripHeaderText}>
            {nearestTrip.destination} • {getCurrentCountryCode()}
            {(!nearestTrip.countryCode || nearestTrip.countryCode.trim() === "") && " (Código estimado)"}
          </Text>
        </View>
      )}

      <MapboxGL.MapView
        style={styles.map}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        styleURL={MapboxGL.StyleURL.Street}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={zoomLevel}
          centerCoordinate={location || DEFAULT_COORD}
        />
        
        <UserLocation 
          visible={true} 
          androidRenderMode={"compass"}
        />
        
        {geoJson && dataSource === 'borders' && (
          <ShapeSource id="country" shape={geoJson}>
            <FillLayer
              id="country-fill"
              style={{
                fillColor: "rgba(37, 99, 235, 0.3)",
                fillOutlineColor: "#2563EB",
                fillAntialias: true,
              }}
            />
          </ShapeSource>
        )}
        {geoJson && dataSource === 'ai' && (
          <ShapeSource id="ai-data" shape={geoJson}>
            <CircleLayer
              id="ai-risk-zones"
              style={{
                circleRadius: [
                  'interpolate', ['exponential', 2], ['zoom'],
                  1, ['/', ['get', 'radius'], 10000],
                  5, ['/', ['get', 'radius'], 1000],  
                  10, ['/', ['get', 'radius'], 100], 
                  15, ['/', ['get', 'radius'], 10], 
                  20, ['/', ['get', 'radius'], 1]  
                ],
                
                circlePitchAlignment: 'map',
                circleColor: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], '#DC2626',
                  ['==', ['get', 'risk_level'], 'high'], '#EF4444',
                  ['==', ['get', 'risk_level'], 'medium'], '#F59E0B',
                  ['==', ['get', 'risk_level'], 'low'], '#10B981',
                  baseColors.pulse
                ],
                circleOpacity: 0.2,
                circleStrokeColor: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], '#DC2626',
                  ['==', ['get', 'risk_level'], 'high'], '#EF4444',
                  ['==', ['get', 'risk_level'], 'medium'], '#F59E0B',
                  ['==', ['get', 'risk_level'], 'low'], '#10B981',
                  baseColors.circle
                ],
                circleStrokeWidth: 2,
                circleStrokeOpacity: 0.6,
              }}
              filter={['has', 'radius']} 
            />

            <CircleLayer
              id="ai-points"
              style={{
                circleRadius: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], 12,
                  ['==', ['get', 'risk_level'], 'high'], 10,
                  ['==', ['get', 'risk_level'], 'medium'], 8,
                  ['==', ['get', 'risk_level'], 'low'], 6,
                  8 
                ],
                circleColor: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], '#DC2626',
                  ['==', ['get', 'risk_level'], 'high'], '#EF4444',
                  ['==', ['get', 'risk_level'], 'medium'], '#F59E0B',
                  ['==', ['get', 'risk_level'], 'low'], '#10B981',
                  baseColors.circle
                ],
                circleStrokeColor: '#ffffff',
                circleStrokeWidth: 2,
                circleOpacity: 0.9,
              }}
            />

            <SymbolLayer
              id="ai-labels"
              style={{
                textField: ['get', 'name'],
                textSize: 12,
                textColor: '#1F2937',
                textHaloColor: '#ffffff',
                textHaloWidth: 2,
                textOffset: [0, 1.5],
                textAnchor: 'top',
                textFont: ['Arial Unicode MS Bold'],
              }}
            />
          </ShapeSource>
        )}
      </MapboxGL.MapView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={zoomIn}>
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={zoomOut}>
          <MaterialIcons name="remove" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={centerOnTrip}>
          <MaterialIcons name="flight" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, dataSource === 'ai' ? styles.aiModeButton : styles.bordersModeButton]} 
          onPress={toggleDataSource}
        >
          <MaterialIcons 
            name={dataSource === 'borders' ? "smart-toy" : "map"} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {dataSource === 'ai' && (
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={[
              styles.categoryButton, 
              selectedCategory === 'salud' && { backgroundColor: "#EF4444" }
            ]}
            onPress={() => setSelectedCategory('salud')}
          >
            <MaterialIcons 
              name="local-hospital" 
              size={20} 
              color={selectedCategory === 'salud' ? "#FFFFFF" : "#EF4444"}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === 'salud' && styles.categoryTextActive
            ]}>Salud</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton, 
              selectedCategory === 'seguridad' && { backgroundColor: "#3B82F6" }
            ]}
            onPress={() => setSelectedCategory('seguridad')}
          >
            <MaterialIcons 
              name="security" 
              size={20} 
              color={selectedCategory === 'seguridad' ? "#FFFFFF" : "#3B82F6"}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === 'seguridad' && styles.categoryTextActive
            ]}>Seguridad</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.categoryButton, 
              selectedCategory === 'cultura' && { backgroundColor: "#10B981" }
            ]}
            onPress={() => setSelectedCategory('cultura')}
          >
            <MaterialIcons 
              name="museum" 
              size={20} 
              color={selectedCategory === 'cultura' ? "#FFFFFF" : "#10B981"}
            />
            <Text style={[
              styles.categoryText,
              selectedCategory === 'cultura' && styles.categoryTextActive
            ]}>Cultura</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Información de estado */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons 
              name={baseColors.icon as any} 
              size={16} 
              color={baseColors.dark} 
            />
            <Text style={styles.infoText}>
              {dataSource === 'borders' ? ' Fronteras' : ` ${selectedCategory}`} 
              {mapLoading && ' • Cargando...'}
              {!mapLoading && geoJson && dataSource === 'ai' && ` • ${geoJson.features?.length || 0} lugares`}
              {nearestTrip && ` • ${getCurrentCountryCode()}`}
            </Text>
          </View>
        </View>
      </View>

      {mapLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingOverlayText}>
            Cargando {selectedCategory}...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#f5f5f5',
    padding: 20
  },
  noTripsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  noTripsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  createTripButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createTripButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tripHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tripHeaderText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  map: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  controls: {
    position: "absolute",
    right: 10,
    top: 50,
    justifyContent: "space-between",
    alignItems: "center",
    height: 200,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#2563EB",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  bordersModeButton: {
    backgroundColor: "#2563EB",
  },
  aiModeButton: {
    backgroundColor: "#10B981",
  },
  categoryContainer: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    boxShadow: "0 2px 5px 0 rgba(0, 0, 0, 0.3)",
    elevation: 5,
    flex: 1,
    alignItems: "center",
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
  },
  categoryTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  infoContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 80,
  },
  infoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 5,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.2)",
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    marginLeft: 4,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlayText: {
    marginTop: 10,
    fontSize: 16,
    color: "#374151",
  },
});