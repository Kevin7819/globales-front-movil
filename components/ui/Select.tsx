import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";

type SelectProps = {
  items: { label: string; value: string }[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
};

export function Select({ items, placeholder, onValueChange }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setOpen(false);
    if (onValueChange) onValueChange(value);
  };

  return (
    <View>
      {/* Trigger */}
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.triggerText}>
          {selected
            ? items.find((i) => i.value === selected)?.label
            : placeholder || "Selecciona una opción"}
        </Text>
      </TouchableOpacity>

      {/* Modal con lista de opciones */}
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.closeText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  triggerText: {
    fontSize: 14,
    color: "#374151",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    width: "80%",
    maxHeight: "60%",
    padding: 12,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  itemText: {
    fontSize: 16,
    color: "#111827",
  },
  closeButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  closeText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
});