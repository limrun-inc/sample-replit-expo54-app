import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ContactItem } from "@/context/ContactsContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;
const SWIPE_OUT_DURATION = 220;

export interface ContactCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

interface Props {
  contact: ContactItem;
  isTop: boolean;
  cardIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#7C3AED", "#0891B2", "#9333EA",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const ContactCard = forwardRef<ContactCardRef, Props>(
  ({ contact, isTop, cardIndex, onSwipeLeft, onSwipeRight }, ref) => {
    const colors = useColors();
    const position = useRef(new Animated.ValueXY()).current;

    const forceSwipe = useCallback(
      (direction: "left" | "right") => {
        const x = direction === "right" ? SCREEN_WIDTH * 1.4 : -SCREEN_WIDTH * 1.4;
        Animated.timing(position, {
          toValue: { x, y: 0 },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: true,
        }).start(() => {
          position.setValue({ x: 0, y: 0 });
          if (direction === "right") onSwipeRight();
          else onSwipeLeft();
        });
      },
      [onSwipeLeft, onSwipeRight, position]
    );

    useImperativeHandle(ref, () => ({
      swipeLeft: () => forceSwipe("left"),
      swipeRight: () => forceSwipe("right"),
    }));

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => isTop,
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy * 0.25 });
        },
        onPanResponderRelease: (_, gesture) => {
          if (!isTop) return;
          if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe("right");
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe("left");
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              friction: 5,
            }).start();
          }
        },
      })
    ).current;

    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ["-18deg", "0deg", "18deg"],
      extrapolate: "clamp",
    });

    const keepOpacity = position.x.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const nopeOpacity = position.x.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    const scale = 1 - cardIndex * 0.045;
    const translateY = cardIndex * -14;
    const opacity = 1 - cardIndex * 0.18;

    if (!isTop) {
      return (
        <View
          style={[
            styles.card,
            {
              transform: [{ scale }, { translateY }],
              opacity,
              backgroundColor: colors.card,
              borderRadius: colors.radius ?? 20,
            },
          ]}
          pointerEvents="none"
        />
      );
    }

    const avatarColor = getAvatarColor(contact.name);

    return (
      <Animated.View
        style={[
          styles.card,
          styles.topCard,
          {
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
            backgroundColor: colors.card,
            borderRadius: colors.radius ?? 20,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* KEEP label */}
        <Animated.View style={[styles.actionLabel, styles.keepLabel, { opacity: keepOpacity }]}>
          <Text style={[styles.actionLabelText, { color: "#10B981" }]}>KEEP</Text>
        </Animated.View>

        {/* NOPE label */}
        <Animated.View style={[styles.actionLabel, styles.nopeLabel, { opacity: nopeOpacity }]}>
          <Text style={[styles.actionLabelText, { color: "#EF4444" }]}>NOPE</Text>
        </Animated.View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.contactName, { color: colors.cardForeground }]} numberOfLines={2}>
            {contact.name}
          </Text>

          {contact.phoneNumbers.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Phone</Text>
              {contact.phoneNumbers.slice(0, 2).map((num, i) => (
                <Text key={i} style={[styles.detailValue, { color: colors.cardForeground }]}>
                  {num}
                </Text>
              ))}
            </View>
          )}

          {contact.emails.length > 0 && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Email</Text>
              {contact.emails.slice(0, 1).map((email, i) => (
                <Text key={i} style={[styles.detailValue, { color: colors.cardForeground }]} numberOfLines={1}>
                  {email}
                </Text>
              ))}
            </View>
          )}

          {contact.phoneNumbers.length === 0 && contact.emails.length === 0 && (
            <Text style={[styles.noInfo, { color: colors.muted }]}>No contact details</Text>
          )}
        </View>

        <Text style={[styles.swipeHint, { color: colors.muted }]}>
          Swipe to decide
        </Text>
      </Animated.View>
    );
  }
);

ContactCard.displayName = "ContactCard";
export default ContactCard;

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
    minHeight: Platform.OS === "web" ? 360 : 380,
  },
  topCard: {
    zIndex: 10,
  },
  avatarSection: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 24,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 38,
    fontWeight: "700" as const,
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  infoSection: {
    paddingHorizontal: 28,
    paddingBottom: 20,
    gap: 12,
  },
  contactName: {
    fontSize: 28,
    fontWeight: "700" as const,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  detailRow: {
    gap: 3,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600" as const,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  noInfo: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  swipeHint: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    paddingBottom: 20,
  },
  actionLabel: {
    position: "absolute",
    top: 32,
    zIndex: 20,
    borderWidth: 3,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  keepLabel: {
    left: 24,
    borderColor: "#10B981",
    transform: [{ rotate: "-18deg" }],
  },
  nopeLabel: {
    right: 24,
    borderColor: "#EF4444",
    transform: [{ rotate: "18deg" }],
  },
  actionLabelText: {
    fontSize: 22,
    fontWeight: "800" as const,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
});
