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
import { getCountryBorders } from "../../services/location";
import { getMapDataCultura, getMapDataSalud, getMapDataSeguridad } from "../../services/MapService";

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? "");

const COSTA_RICA_COORD: [number, number] = [-84.0907, 9.7489];

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

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permiso de ubicación denegado");
          setLoading(false);
          return;
        }
        const current = await Location.getCurrentPositionAsync({});
        setLocation([current.coords.longitude, current.coords.latitude]);
      } catch (err) {
        console.error("Error obteniendo ubicación:", err);
      } finally {
        setLoading(false);
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    const loadMapData = async () => {
      if (hasLoadedGeoJson.current && dataSource === 'borders') return;
      
      setMapLoading(true);
      const loadId = Math.random().toString(36).substring(2, 8);
      console.log(`[${loadId}] Cargando datos desde: ${dataSource}, categoría: ${selectedCategory}`);

      try {
        let mapData;

        if (dataSource === 'borders') {
          hasLoadedGeoJson.current = true;
          mapData = await getCountryBorders("CRI");
          console.log(`[${loadId}] Fronteras cargadas:`, mapData ? "GeoJSON válido" : "Sin datos");
        } else {
          switch (selectedCategory) {
            case 'salud':
              mapData = await getMapDataSalud("CRI");
              break;
            case 'seguridad':
              mapData = await getMapDataSeguridad("CRI");
              break;
            case 'cultura':
              mapData = await getMapDataCultura("CRI");
              break;
          }
          console.log(`[${loadId}] AI ${selectedCategory} cargado:`, mapData ? "Datos recibidos" : "Sin datos");
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
        } else if (mapData?.features) {
          processedGeoJson = { type: "FeatureCollection", features: mapData.features };
        }

        if (processedGeoJson) {
          setGeoJson(processedGeoJson);
          console.log(`[${loadId}] 🗺️ ${dataSource.toUpperCase()} data establecida (${processedGeoJson.features?.length || 0} features)`);
          
          // Log de los datos recibidos para debug
          if (dataSource === 'ai' && processedGeoJson.features) {
            processedGeoJson.features.forEach((feature: any, idx: number) => {
              console.log(` ${idx + 1}. ${feature.properties?.name} - Risk: ${feature.properties?.risk_level} - Radius: ${feature.properties?.radius}`);
            });
          }
        } else {
          console.warn(`[${loadId}] Formato inesperado:`, mapData);
          setGeoJson(null);
        }

      } catch (err: any) {
        console.error(`[${loadId}] Error cargando ${dataSource}:`, {
          message: err.message,
          stack: err.stack,
        });
        setGeoJson(null);
      } finally {
        setMapLoading(false);
      }
    };

    loadMapData();
  }, [dataSource, selectedCategory]);

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

  const toggleDataSource = () => {
    const newDataSource = dataSource === 'borders' ? 'ai' : 'borders';
    setDataSource(newDataSource);
    console.log(`🔄 Cambiando a modo: ${newDataSource}`);
  };

  const getCategoryColor = () => {
    switch (selectedCategory) {
      case 'salud':
        return { 
          circle: "#EF4444",
          dark: "#DC2626",
          pulse: "#FCA5A5",
          light: "#FEE2E2",
          icon: "🏥"
        };
      case 'seguridad':
        return { 
          circle: "#3B82F6",
          dark: "#1D4ED8",
          pulse: "#93C5FD",
          light: "#EFF6FF",
          icon: "🛡️"
        };
      case 'cultura':
        return { 
          circle: "#10B981",
          dark: "#047857",
          pulse: "#6EE7B7",
          light: "#ECFDF5",
          icon: "🎭"
        };
      default:
        return { 
          circle: "#2563EB",
          dark: "#1D4ED8",
          pulse: "#93C5FD",
          light: "#EFF6FF",
          icon: "📍"
        };
    }
  };

  const getCircleRadius = (feature: any) => {
    if (feature.properties?.radius) {
      return feature.properties.radius / 10; 
    }
    
    const riskLevel = feature.properties?.risk_level;
    switch (riskLevel) {
      case 'critical': return 80;
      case 'high': return 60;
      case 'medium': return 40;
      case 'low': return 20;
      default: return 30; 
    }
  };

  const getRiskColor = (feature: any) => {
    const riskLevel = feature.properties?.risk_level;
    const baseColors = getCategoryColor();
    
    if (!riskLevel) return baseColors;

    const riskColors = {
      critical: { circle: "#DC2626", pulse: "#FCA5A5", light: "#FEE2E2" },
      high: { circle: "#EF4444", pulse: "#FCA5A5", light: "#FEE2E2" },
      medium: { circle: "#F59E0B", pulse: "#FCD34D", light: "#FEF3C7" },
      low: { circle: "#10B981", pulse: "#6EE7B7", light: "#D1FAE5" }
    };

    return riskColors[riskLevel as keyof typeof riskColors] || baseColors;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  const baseColors = getCategoryColor();

  return (
    <View style={styles.container}>
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
          centerCoordinate={location ?? COSTA_RICA_COORD}
        />
        
        <UserLocation 
          visible={true} 
          androidRenderMode={"compass"}
        />
        
        {/* CAPA DE FRONTERAS */}
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

        {/* CAPAS PARA DATOS AI */}
        {geoJson && dataSource === 'ai' && (
          <ShapeSource id="ai-data" shape={geoJson}>
            {/* Capa 1: Círculos de radio (para zonas de riesgo) */}
            <CircleLayer
              id="ai-risk-zones"
              style={{
                circleRadius: [
                  'interpolate', ['linear'],
                  ['zoom'],
                  10, ['*', ['get', 'radius'], 0.1],  // Escalar según zoom
                  15, ['*', ['get', 'radius'], 0.2],
                  20, ['*', ['get', 'radius'], 0.3]
                ],
                circleColor: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], '#DC2626',
                  ['==', ['get', 'risk_level'], 'high'], '#EF4444',
                  ['==', ['get', 'risk_level'], 'medium'], '#F59E0B',
                  ['==', ['get', 'risk_level'], 'low'], '#10B981',
                  baseColors.pulse  // Color por defecto
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

            {/* Capa 2: Puntos centrales */}
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

            {/* Capa 3: Etiquetas de nombres */}
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

            {/* Capa 4: Iconos de riesgo */}
            <SymbolLayer
              id="ai-risk-icons"
              style={{
                textField: [
                  'case',
                  ['==', ['get', 'risk_level'], 'critical'], '🔴',
                  ['==', ['get', 'risk_level'], 'high'], '🟠',
                  ['==', ['get', 'risk_level'], 'medium'], '🟡',
                  ['==', ['get', 'risk_level'], 'low'], '🟢',
                  baseColors.icon
                ],
                textSize: 14,
                textOffset: [0, -0.5],
              }}
            />
          </ShapeSource>
        )}
      </MapboxGL.MapView>

      {/* Controles de zoom y ubicación */}
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
              style={styles.categoryIcon}
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
              style={styles.categoryIcon}
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
              style={styles.categoryIcon}
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
          <Text style={styles.infoText}>
            {dataSource === 'borders' ? ' Fronteras' : `${baseColors.icon} ${selectedCategory}`} 
            {mapLoading && ' • Cargando...'}
            {!mapLoading && geoJson && dataSource === 'ai' && ` • ${geoJson.features?.length || 0} lugares`}
          </Text>
        </View>
        
        {!geoJson && !loading && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Cargando datos del mapa...</Text>
          </View>
        )}
      </View>

      {/* Indicador de carga del mapa */}
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
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
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
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
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
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,
    flex: 1,
    alignItems: "center",
  },
  categoryIcon: {
    marginRight: 5,
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
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