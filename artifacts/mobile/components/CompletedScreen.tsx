import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  keepCount: number;
  deleteCount: number;
  isApplying: boolean;
  isWeb: boolean;
  onApply: () => void;
  onReset: () => void;
}

export default function CompletedScreen({
  keepCount,
  deleteCount,
  isApplying,
  isWeb,
  onApply,
  onReset,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: topPad + 20,
          paddingBottom: bottomPad + 20,
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather name="check-circle" size={52} color="#10B981" />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>All Done!</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Here's a summary of your decisions
      </Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: "rgba(16,185,129,0.1)" }]}>
          <Text style={[styles.statNumber, { color: "#10B981" }]}>{keepCount}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>Keeping</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
          <Text style={[styles.statNumber, { color: "#EF4444" }]}>{deleteCount}</Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>To Delete</Text>
        </View>
      </View>

      {deleteCount > 0 && !isWeb && (
        <TouchableOpacity
          style={[styles.deleteButton, isApplying && styles.buttonDisabled]}
          onPress={onApply}
          disabled={isApplying}
          activeOpacity={0.85}
        >
          {isApplying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Feather name="trash-2" size={18} color="#FFFFFF" />
              <Text style={styles.deleteButtonText}>
                Delete {deleteCount} Contact{deleteCount !== 1 ? "s" : ""}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {isWeb && deleteCount > 0 && (
        <View style={styles.webNote}>
          <Text style={[styles.webNoteText, { color: colors.muted }]}>
            Contact deletion is only available on iOS and Android devices.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.resetButton, { borderColor: colors.border }]}
        onPress={onReset}
        activeOpacity={0.75}
      >
        <Feather name="refresh-cw" size={16} color={colors.muted} />
        <Text style={[styles.resetButtonText, { color: colors.muted }]}>
          Start Over
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 20,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(16,185,129,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: -8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 40,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  webNote: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 14,
    width: "100%",
  },
  webNoteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
});
