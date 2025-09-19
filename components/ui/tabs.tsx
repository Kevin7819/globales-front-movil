import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type TabsProps = {
  defaultValue?: string;
  children: React.ReactNode;
};

type TabsTriggerProps = {
  value: string;
  label: string;
};

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
  active?: string;
};

export function Tabs({ defaultValue, children }: TabsProps) {
  const [active, setActive] = useState(defaultValue);

  return (
    <View>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        return React.cloneElement(child as React.ReactElement<any>, {
          active,
          setActive,
        });
      })}
    </View>
  );
}

export function TabsList({ children }: { children: React.ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

export function TabsTrigger({
  value,
  label,
  active,
  setActive,
}: TabsTriggerProps & { active?: string; setActive?: (v: string) => void }) {
  const isActive = active === value;
  return (
    <TouchableOpacity
      style={[styles.trigger, isActive && styles.triggerActive]}
      onPress={() => setActive && setActive(value)}
    >
      <Text style={[styles.triggerText, isActive && styles.triggerTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function TabsContent({
  value,
  children,
  active,
}: TabsContentProps & { active?: string }) {
  if (active !== value) return null;
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  trigger: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  triggerActive: {
    borderBottomColor: "#2563EB",
  },
  triggerText: {
    fontSize: 14,
    color: "#6B7280",
  },
  triggerTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },
  content: {
    paddingTop: 12,
  },
});