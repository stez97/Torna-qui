import React from "react";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;   // dimensione totale in px
  color?: string;  // colore base (rosso default)
};

export default function RealisticPin({ size = 44, color = "#E53935" }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Corpo pin: più contrasto, più “volume” */}
        <LinearGradient id="pinGrad" x1="18" y1="8" x2="48" y2="46">
          <Stop offset="0" stopColor="#FF7A7A" stopOpacity="1" />
          <Stop offset="0.35" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor="#8E0F0F" stopOpacity="1" />
        </LinearGradient>

        {/* Ombra interna leggera (fa sembrare la sfera più profonda) */}
        <LinearGradient id="pinShade" x1="22" y1="10" x2="44" y2="36">
          <Stop offset="0" stopColor="#000" stopOpacity="0.00" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </LinearGradient>

        {/* Metallo stelo */}
        <LinearGradient id="metalGrad" x1="30" y1="38" x2="34" y2="60">
          <Stop offset="0" stopColor="#F3F4F6" stopOpacity="1" />
          <Stop offset="0.45" stopColor="#9CA3AF" stopOpacity="1" />
          <Stop offset="1" stopColor="#6B7280" stopOpacity="1" />
        </LinearGradient>

        {/* Metallo punta (più scuro) */}
        <LinearGradient id="tipGrad" x1="28" y1="56" x2="36" y2="62">
          <Stop offset="0" stopColor="#6B7280" stopOpacity="1" />
          <Stop offset="1" stopColor="#111827" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      <G>
        {/* Ombra morbida sotto la testina (stacco dal bottone) */}
        <Ellipse cx="32" cy="44.5" rx="14" ry="5.5" fill="#000" opacity="0.12" />

        {/* Testina (sfera) */}
        <Path
          d="M32 6c-10.2 0-18.5 8.3-18.5 18.5S21.8 43 32 43s18.5-8.3 18.5-18.5S42.2 6 32 6z"
          fill="url(#pinGrad)"
        />

        {/* Ombra “di forma” sopra la sfera (fa 3D) */}
        <Path
          d="M32 6c-10.2 0-18.5 8.3-18.5 18.5S21.8 43 32 43s18.5-8.3 18.5-18.5S42.2 6 32 6z"
          fill="url(#pinShade)"
        />

        {/* Highlight principale (mezzaluna) */}
        <Ellipse cx="24.5" cy="17.5" rx="8.5" ry="6.5" fill="#fff" opacity="0.22" />
        {/* Puntino speculare (effetto “luce”) */}
        <Circle cx="22.5" cy="15.5" r="2.2" fill="#fff" opacity="0.28" />

        {/* Stelo */}
        <Path
          d="M31.2 42h1.6c1.5 0 2.7 1.2 2.7 2.7V58c0 1.5-1.2 2.7-2.7 2.7h-1.6c-1.5 0-2.7-1.2-2.7-2.7V44.7c0-1.5 1.2-2.7 2.7-2.7z"
          fill="url(#metalGrad)"
        />

        {/* “filo” luce sul metallo (fa cromatura) */}
        <Path
          d="M30.7 44.5c0-1 .8-1.8 1.8-1.8h.2c.35 0 .65.3.65.65V58.4c0 .35-.3.65-.65.65h-.2c-1 0-1.8-.8-1.8-1.8V44.5z"
          fill="#fff"
          opacity="0.18"
        />
      </G>
    </Svg>
  );
}
