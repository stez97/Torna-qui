import React, { useRef, useState } from "react";
import { Pressable, Animated, Image, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  size?: number;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

const BTN_UP = require("../assets/images/pin_btn_up.png");
const BTN_DOWN = require("../assets/images/pin_btn_down.png");
/*const SHADOW = require("../assets/images/pin_btn_shadow.png");*/

export default function Pin3DButton({
  size = 80,
  onPress,
  disabled = false,
  style,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  // ✅ serve per consentire onPress SOLO se il touch è dentro al cerchio
  const validPressRef = useRef(false);

  // Quanto del quadrato size×size è realmente “pieno” dal bottone visibile.
  // Se i tuoi PNG hanno molta trasparenza attorno, tienilo più basso (0.65–0.72).
  const HIT_DIAMETER_RATIO = 0.72;

  const isInsideCircle = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const cx = size / 2;
    const cy = size / 2;
    const r = (size * HIT_DIAMETER_RATIO) / 2;

    const dx = locationX - cx;
    const dy = locationY - cy;
    return dx * dx + dy * dy <= r * r;
  };

  const springTo = (toValue: number) =>
    Animated.spring(anim, {
      toValue,
      useNativeDriver: true,
      stiffness: 260,
      damping: 22,
      mass: 0.9,
    });

  const handlePressIn = (e: any) => {
    if (disabled) return;
    if (!isInsideCircle(e)) return;

    validPressRef.current = true;
    setIsPressed(true);
    springTo(1).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    if (!validPressRef.current) return;

    springTo(0).start(({ finished }) => {
      if (finished) setIsPressed(false);
    });

    // reset subito dopo (così un tap fuori non triggera)
    setTimeout(() => (validPressRef.current = false), 0);
  };

  const handlePress = () => {
    if (disabled) return;
    if (!validPressRef.current) return;

    onPress?.();
    validPressRef.current = false;
  };

  // Animazioni
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 3] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] });

  const opacity = disabled ? 0.45 : 1;

  return (
    <View style={style}>
      <Pressable
        disabled={disabled}
        /*onPress={handlePress}*/
        onPress={() => {
            console.log("PIN BUTTON pressed");
            onPress?.();
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={0}
        style={{ width: size, height: size, opacity, flex: 0 }}
        accessibilityRole="button"
        accessibilityLabel="Segna questo posto"
      >
        <View style={styles.center}>

          <Animated.View
            style={{
              width: size,
              height: size,
              transform: [{ translateY }, { scale }],
            }}
          >
            <Image
              source={isPressed ? BTN_DOWN : BTN_UP}
              resizeMode="contain"
              style={{ width: size, height: size }}
            />
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
  /*shadow: { position: "absolute" },*/
});
