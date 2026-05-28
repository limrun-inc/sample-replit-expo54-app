import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface Props {
  onRequest: () => void;
  isDenied?: boolean;
}

export default function PermissionScreen({ onRequest, isDenied }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPad + 20, paddingBottom: bottomPad + 20 },
      ]}
    >
      <View style={styles.iconWrap}>
        <Feather name="users" size={52} color="#7C3AED" />
      </View>

      <Text style={[styles.title, { color: colors.foreground }]}>
        {isDenied ? "Permission Needed" : "Access Contacts"}
      </Text>

      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {isDenied
          ? "This app needs access to your contacts to work. Please allow access in Settings to continue."
          : "Sweep through your contacts and decide what to keep and what to delete — one swipe at a time."}
      </Text>

      <View style={styles.features}>
        {[
          { icon: "swipe" as const, label: "Swipe right to keep" },
          { icon: "trash-2" as const, label: "Swipe left to delete" },
          { icon: "check-circle" as const, label: "Review before deleting" },
        ].map((item) => (
          <View key={item.label} style={styles.feature}>
            <View style={styles.featureIcon}>
              <Feather name={item.icon} size={18} color="#7C3AED" />
            </View>
            <Text style={[styles.featureText, { color: colors.foreground }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={onRequest}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {isDenied ? "Open Settings" : "Allow Access"}
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
    gap: 24,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(124,58,237,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  features: {
    width: "100%",
    gap: 16,
    marginVertical: 8,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(124,58,237,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  button: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
  },
});
