import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AiApi } from "../../services/aiApi";

type Msg = {
  id: string;
  role: "user" | "assistant" | "system" | "error";
  text: string;
};

const STORAGE_KEY = "@chat_history";

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<"es" | "en">("es");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const greetingText =
    lang === "es"
      ? "👋 ¡Pura vida! Soy Orbis IA 🌎. Preguntame lo que querás."
      : "👋 Hey there! I'm Orbis AI 🌍. Ask me anything.";

  const clearedText =
    lang === "es"
      ? "🧹 Historial borrado. ¡Listo para empezar de nuevo!"
      : "🧹 History cleared. Ready to start fresh!";

  // 🔹 Animación inicial
  const animateFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // 🔹 Cargar historial o saludo inicial
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        setMessages([{ id: "sys_1", role: "system", text: greetingText }]);
      }
      animateFadeIn();
    })();
  }, []);

  // 🔹 Cambiar idioma → actualizar saludo si es mensaje inicial
  useEffect(() => {
    if (messages.length === 0 || messages[0].role === "system") {
      setMessages([{ id: "sys_1", role: "system", text: greetingText }]);
    }
  }, [lang]);

  // 🔹 Guardar historial
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // 🔹 Auto-scroll
  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg: Msg = { id: `u_${Date.now()}`, role: "user", text: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const answer = await AiApi.ask(question, lang);
      const aiMsg: Msg = {
        id: `a_${Date.now()}`,
        role: "assistant",
        text: answer || (lang === "es" ? "No recibí respuesta 🤔" : "No response 🤔"),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: "error",
          text:
            lang === "es"
              ? "Error al consultar la IA."
              : "AI request failed.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setMessages([{ id: "sys_1", role: "system", text: clearedText }]);
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const isUser = item.role === "user";
    const isAssistant = item.role === "assistant";
    const isSystem = item.role === "system";
    const isError = item.role === "error";

    const bubbleStyle = [
      styles.bubble,
      isUser && styles.bubbleUser,
      isAssistant && styles.bubbleAssistant,
      isSystem && styles.bubbleSystem,
      isError && styles.bubbleError,
    ];

    const textStyle = [
      styles.text,
      isUser && styles.textUser,
      (isAssistant || isSystem) && styles.textAssistant,
      isError && styles.textError,
    ];

    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={[styles.row, isUser ? styles.right : styles.left]}>
          <View style={bubbleStyle}>
            <Text style={textStyle}>{item.text}</Text>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles-outline" size={22} color="#2563EB" />
          <Text style={styles.headerTitle}>
            {lang === "es" ? "Orbis Chat IA" : "Orbis AI Chat"}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setLang((p) => (p === "es" ? "en" : "es"))}
            style={[styles.langBtn, Platform.OS === "web" && styles.webCursorPointer]}
          >
            <Feather name="globe" size={16} color="#2563EB" />
            <Text style={styles.langText}>{lang.toUpperCase()}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={clearHistory}
            style={[styles.clearBtn, Platform.OS === "web" && styles.webCursorPointer]}
          >
            <Feather name="trash-2" size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder={lang === "es" ? "Preguntame lo que sea…" : "Ask me anything…"}
          value={input}
          onChangeText={setInput}
          style={[
            styles.input,
            Platform.OS === "web" && styles.webInput,
          ]}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={send}
          disabled={!input.trim() || loading}
          style={[
            styles.sendBtn,
            (!input.trim() || loading) && styles.sendBtnDisabled,
            Platform.OS === "web" && styles.webCursorPointer,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Feather name="send" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF2FF",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    elevation: 1,
  },
  headerLeft: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 8 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#111827" 
  },
  actions: { 
    flexDirection: "row", 
    gap: 10 
  },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  langText: { 
    color: "#2563EB", 
    fontWeight: "600" 
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 999,
    padding: 6,
    backgroundColor: "#fff",
  },
  listContent: { 
    padding: 12, 
    paddingBottom: 80 
  },
  row: { 
    width: "100%", 
    marginVertical: 4, 
    flexDirection: "row" 
  },
  left: { 
    justifyContent: "flex-start" 
  },
  right: { 
    justifyContent: "flex-end" 
  },
  bubble: {
    maxWidth: "85%",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    elevation: 1,
  },
  bubbleUser: { 
    backgroundColor: "#2563EB" 
  },
  bubbleAssistant: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bubbleSystem: { 
    backgroundColor: "#E0E7FF" 
  },
  bubbleError: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  text: { 
    fontSize: 14 
  },
  textUser: { 
    color: "#fff" 
  },
  textAssistant: { 
    color: "#111827" 
  },
  textError: { 
    color: "#991B1B" 
  },
  inputBar: {
    position: "absolute",
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 8,
    boxShadow: "0 1px 4px 0 rgba(0, 0, 0, 0.05)",
    elevation: 2, 
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: "#111827",
  },
  sendBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: { 
    opacity: 0.6 
  },
  webCursorPointer: {
    cursor: "pointer",
  },
  webInput: {
    outlineWidth: 0,
    cursor: "text",
  },
});