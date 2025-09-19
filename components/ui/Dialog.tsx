import React, { useState, createContext, useContext, ReactNode } from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";

const DialogContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

export function Dialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children }: { children: ReactNode }) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogTrigger debe estar dentro de <Dialog>");

  return (
    <TouchableOpacity onPress={() => ctx.setOpen(true)}>
      {typeof children === "string" ? (
        <Text style={{ color: "#2563EB", fontWeight: "600" }}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export function DialogContent({ children }: { children: ReactNode }) {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("DialogContent debe estar dentro de <Dialog>");

  return (
    <Modal
      visible={ctx.open}
      transparent
      animationType="fade"
      onRequestClose={() => ctx.setOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>{children}</View>
      </View>
    </Modal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <View style={{ marginBottom: 12 }}>{children}</View>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    width: "90%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});