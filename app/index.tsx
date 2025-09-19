import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Página Home funcionando 🚀</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push("/auth/login")}>
        <Text style={styles.buttonText}>Ir al page Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.outline]} onPress={() => router.push("/auth/register")}>
        <Text style={[styles.buttonText, { color: "#2563EB" }]}>Ir al Registro</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9FAFB", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 24, color: "#111827" },
  button: { backgroundColor: "#2563EB", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, marginVertical: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#2563EB" },
});