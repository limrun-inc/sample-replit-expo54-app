import React, { useRef } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import ActionButtons from "@/components/ActionButtons";
import CompletedScreen from "@/components/CompletedScreen";
import ContactCard, { ContactCardRef } from "@/components/ContactCard";
import PermissionScreen from "@/components/PermissionScreen";
import { useContacts } from "@/context/ContactsContext";
import { useColors } from "@/hooks/useColors";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const cardRef = useRef<ContactCardRef>(null);

  const {
    contacts,
    currentIndex,
    permissionStatus,
    isDone,
    toDeleteCount,
    isApplying,
    decisions,
    swipeRight,
    swipeLeft,
    applyDeletions,
    reset,
    requestPermission,
  } = useContacts();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (permissionStatus === "loading") {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.muted }]}>Loading…</Text>
      </View>
    );
  }

  if (permissionStatus === "denied") {
    return <PermissionScreen onRequest={requestPermission} isDenied />;
  }

  if (permissionStatus !== "granted" && permissionStatus !== "web") {
    return <PermissionScreen onRequest={requestPermission} />;
  }

  if (isDone) {
    const keepCount = Object.values(decisions).filter((d) => d === "keep").length;
    return (
      <CompletedScreen
        keepCount={keepCount}
        deleteCount={toDeleteCount}
        isApplying={isApplying}
        isWeb={permissionStatus === "web"}
        onApply={applyDeletions}
        onReset={reset}
      />
    );
  }

  const progress = contacts.length > 0 ? currentIndex / contacts.length : 0;
  const remaining = contacts.length - currentIndex;

  const visibleContacts = contacts.slice(currentIndex, currentIndex + 3);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Contacts</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {remaining} remaining
          </Text>
        </View>
        <View style={styles.headerRight}>
          {toDeleteCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{toDeleteCount} to delete</Text>
            </View>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceElevated ?? "#1F2937" }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: "#7C3AED",
            },
          ]}
        />
      </View>

      {/* Card Stack */}
      <View style={[styles.cardStack, { height: SCREEN_HEIGHT * 0.52 }]}>
        {visibleContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="users" size={40} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No contacts loaded</Text>
          </View>
        ) : (
          [...visibleContacts].reverse().map((contact, reverseIdx) => {
            const cardIndex = visibleContacts.length - 1 - reverseIdx;
            const isTop = cardIndex === 0;
            return (
              <ContactCard
                key={contact.id}
                ref={isTop ? cardRef : undefined}
                contact={contact}
                isTop={isTop}
                cardIndex={cardIndex}
                onSwipeLeft={swipeLeft}
                onSwipeRight={swipeRight}
              />
            );
          })
        )}
      </View>

      {/* Labels hint */}
      <View style={styles.hintRow}>
        <View style={styles.hintItem}>
          <View style={[styles.hintDot, { backgroundColor: "#EF4444" }]} />
          <Text style={[styles.hintText, { color: colors.muted }]}>Delete</Text>
        </View>
        <View style={styles.hintItem}>
          <View style={[styles.hintDot, { backgroundColor: "#10B981" }]} />
          <Text style={[styles.hintText, { color: colors.muted }]}>Keep</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: bottomPad + 16 }]}>
        <ActionButtons
          onDelete={() => cardRef.current?.swipeLeft()}
          onKeep={() => cardRef.current?.swipeRight()}
          disabled={visibleContacts.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingTop: 4,
  },
  badge: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  progressTrack: {
    height: 3,
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    minWidth: 3,
  },
  cardStack: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginTop: 16,
    marginBottom: 4,
  },
  hintItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  hintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  actions: {
    paddingTop: 16,
    alignItems: "center",
  },
});
