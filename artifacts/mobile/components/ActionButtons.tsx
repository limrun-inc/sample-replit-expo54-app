import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Props {
  onDelete: () => void;
  onKeep: () => void;
  disabled?: boolean;
}

export default function ActionButtons({ onDelete, onKeep, disabled }: Props) {
  const handleDelete = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  const handleKeep = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onKeep();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, styles.deleteButton, disabled && styles.disabled]}
        onPress={handleDelete}
        activeOpacity={0.75}
      >
        <Feather name="x" size={30} color="#EF4444" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.keepButton, disabled && styles.disabled]}
        onPress={handleKeep}
        activeOpacity={0.75}
      >
        <Feather name="check" size={30} color="#10B981" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
  },
  button: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.25)",
  },
  keepButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.25)",
  },
  disabled: {
    opacity: 0.4,
  },
});
