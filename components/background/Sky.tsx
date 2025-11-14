import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, Dimensions, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function Sky() {
  const cloudA = useRef(new Animated.Value(-300)).current;
  const cloudB = useRef(new Animated.Value(-400)).current;
  const cloudC = useRef(new Animated.Value(width)).current;
  const planeA = useRef(new Animated.Value(-200)).current;
  const planeB = useRef(new Animated.Value(-400)).current;
  const planeC = useRef(new Animated.Value(width)).current;
  useEffect(() => {
    const loopMove = (anim: Animated.Value, from: number, to: number, duration: number, delay = 0) => {
      anim.setValue(from);
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: to,
            duration,
            delay,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.timing(anim, {
            toValue: from,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start();
    };
    loopMove(cloudA, -300, width + 300, 24000, 0);
    loopMove(cloudB, -400, width + 400, 30000, 4000);
    loopMove(cloudC, width, -500, 26000, 2000);
    loopMove(planeA, -200, width + 200, 12000, 1000);
    loopMove(planeB, -400, width + 400, 16000, 3000);
    loopMove(planeC, width, -200, 14000, 5000);
  }, []);
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["#001134", "#0c2d5a", "#1b6fb3", "#60a5fa"]}
        start={[0.1, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.cloud, { transform: [{ translateX: cloudA }], top: height * 0.12, opacity: 0.85, width: 260, height: 80, borderRadius: 60 }]} />
      <Animated.View style={[styles.cloud, { transform: [{ translateX: cloudB }], top: height * 0.25, opacity: 0.82, width: 210, height: 64, borderRadius: 50 }]} />
      <Animated.View style={[styles.cloud, { transform: [{ translateX: cloudC }], top: height * 0.38, opacity: 0.75, width: 300, height: 90, borderRadius: 70 }]} />
      <Animated.View style={[styles.cloudSmall, { transform: [{ translateX: cloudA }], top: height * 0.5, opacity: 0.6 }]} />
      <Animated.View style={[styles.cloudSmall, { transform: [{ translateX: cloudB }], top: height * 0.6, opacity: 0.55 }]} />
      <Animated.View style={[styles.planeWrap, { transform: [{ translateX: planeA }], top: height * 0.08, transformOrigin: "center" }]}>
        <Ionicons name="airplane" size={28} color="white" />
      </Animated.View>
      <Animated.View style={[styles.planeWrap, { transform: [{ translateX: planeB }], top: height * 0.35 }]}>
        <Ionicons name="airplane" size={20} color="#FFED4A" />
      </Animated.View>
      <Animated.View style={[styles.planeWrap, { transform: [{ translateX: planeC }], top: height * 0.22 }]}>
        <Ionicons name="airplane" size={24} color="#ffffff" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0
  },
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3
  },
  cloudSmall: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.85)",
    width: 110,
    height: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  planeWrap: {
    position: "absolute",
    left: -200
  }
});
