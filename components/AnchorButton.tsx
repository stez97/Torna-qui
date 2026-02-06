// components/AnchorButton.tsx
import RealisticPin from "@/components/RealisticPin";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
// (Facoltativo) Haptics:
// import * as Haptics from "expo-haptics";

type Props = {
  onPress: () => void;
  size?: number; // default 144
  pinSize?: number; // default proporzionale
  variant?: "withHighlight" | "clean"; // highlight on/off
};

export default function AnchorButton({
  onPress,
  size = 144,
  pinSize,
  variant = "withHighlight",
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [pressed, setPressed] = useState(false);
  const R = size / 2;

  const finalPinSize = pinSize ?? Math.round(size * 0.38); // ~55 su 144

  const pressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 28,
      bounciness: 8,
    }).start();
    Animated.spring(translateY, {
      toValue: 3,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 8,
    }).start();
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  const handlePress = () => {
    // (Facoltativo) Haptic:
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable onPress={handlePress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [{ scale }, { translateY }],
        }}
      >
        {/* Shadow base */}
        <View
          style={[
            styles.shadow,
            pressed ? styles.shadowPressed : styles.shadowRest,
            { width: size, height: size, borderRadius: R },
          ]}
        />

        {/* Body */}
        <LinearGradient
          colors={["#3B82F6", "#2563EB", "#1D4ED8"]}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.85, y: 0.95 }}
          style={{ width: size, height: size, borderRadius: R, overflow: "hidden" }}
        >
          {/* Rim light */}
          <View style={styles.rim} />
          {variant === "withHighlight" ? (
            <View style={styles.highlight} />
          ) : null}

          {/* Icon */}
          <View style={styles.iconWrap}>
            <RealisticPin size={finalPinSize} color="#FFFFFF" />
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: "absolute",
    backgroundColor: "transparent",
    shadowColor: "#000",
  },
  shadowRest: {
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  shadowPressed: {
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  rim: {
    position: "absolute",
    inset: 0,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
  },
  highlight: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
    transform: [{ scaleX: 1.2 }, { scaleY: 0.9 }],
  },

  iconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
