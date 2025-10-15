import MapboxGL, {
  Camera,
  FillLayer,
  ShapeSource,
  UserLocation,
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
import { getCountryBorders } from "../../services/location";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

MapboxGL.setAccessToken(Constants.expoConfig?.extra?.mapboxAccessToken ?? "");

const COSTA_RICA_COORD: [number, number] = [-84.0907, 9.7489];

export default function MapScreen() {
  const [geoJson, setGeoJson] = useState<any>(null);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  
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
    const loadGeoJsonData = async () => {
      if (hasLoadedGeoJson.current) return;
      hasLoadedGeoJson.current = true;

      const loadId = Math.random().toString(36).substring(2, 8); // ID único para debug
      console.log(`[${loadId}] Iniciando carga de GeoJSON...`);

      try {
        const geoData = await getCountryBorders("CRI");
        console.log(`[${loadId}] Respuesta recibida:`, geoData ? "GeoJSON válido" : "Sin datos");

        if (!geoData) {
          console.warn(`[${loadId}] Respuesta vacía del servidor`);
          return;
        }

        if (geoData.type === "FeatureCollection") {
          setGeoJson(geoData);
          console.log(`[${loadId}] 🗺️ GeoJSON establecido correctamente (${geoData.features?.length || 0} features)`);
        } else if (geoData?.GeoJson?.type === "FeatureCollection") {
          setGeoJson(geoData.GeoJson);
          console.log(`[${loadId}] GeoJSON establecido desde propiedad GeoJson`);
        } else {
          console.warn(`[${loadId}] Formato inesperado:`, {
            type: geoData.type,
            keys: Object.keys(geoData),
            hasGeoJson: !!geoData.GeoJson
          });
        }
      } catch (err: any) {
        console.error(`[${loadId}] Error cargando GeoJSON:`, {
          message: err.message,
          stack: err.stack,
          status: err.status
        });
      }
    };

    loadGeoJsonData();
  }, []);

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
        zoomLevel: 12,
        animationDuration: 500,
      });
    }
  };

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
        
        {geoJson && (
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
      </MapboxGL.MapView>

      {/* Controles de zoom y ubicación */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={zoomIn}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={zoomOut}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={centerOnUser}>
          <MaterialIcons name="my-location" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Estado de carga */}
      {!geoJson && !loading && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Cargando fronteras...</Text>
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
    height: 150,
  },
  button: {
    backgroundColor: "#2563EB",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "bold" 
  },
  infoBox: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
});