import AnchorButton from "@/components/AnchorButton";
import Pin3DButton from "@/components/Pin3DButton";
import { Pressable, StyleSheet, Text, View, Alert, Linking } from "react-native";

import { useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import React, { useCallback, useState } from "react";
import { Spot } from "@/types/Spot";
import { getLastSpot, saveSpot } from "@/storage/SpotStorage";
import {
  requestLocationPermission,
  getCurrentPositionHigh,
  getAddressLabel,
} from "@/services/locationService";


export default function HomeScreen() {
  const router = useRouter();

   const [lastSpot, setLastSpot] = useState<Spot | null>(null);

   const handleOpenMaps = async (spot: Spot) => {
    try {
      const lat = spot.lat;
      const lng = spot.lng;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${lat},${lng}`
      )}`;
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert("Errore", "Impossibile aprire Google Maps.");
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile aprire la mappa.");
    }
  };

   useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const last = await getLastSpot();
        if (isActive) {
          setLastSpot(last);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

    const handleSaveSpot = async () => {
      try{
        const granted = await requestLocationPermission();
        if (!granted) {
          Alert.alert(
            "Permesso posizione",
            "Per salvare un posto serve il permesso di localizzazione."
          );
          return;
        }

        const pos = await getCurrentPositionHigh();

        const addressLabel = await getAddressLabel(
          pos.coords.latitude,
          pos.coords.longitude
        );

        const spot: Spot = {
          id: Crypto.randomUUID(),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          createdAt: new Date().toISOString(),
          title: "Posto salvato", // per ora placeholder
          addressLabel,
        };

        await saveSpot(spot);
        setLastSpot(spot);
      }
      catch(e: any){
        Alert.alert("Errore", e?.message ?? "Impossibile salvare la posizione.");
      }
    }

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Pin3DButton size={250} onPress={handleSaveSpot} />

        <Text style={styles.title}>Segna questo posto</Text>
        <Text style={styles.subtitle}>Per tornarci quando vuoi</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <Text style={styles.sheetLabel}>ULTIMO POSTO SALVATO</Text>
          <Pressable onPress={() => router.push("/explore")}>
            <Text style={styles.sheetLink}>Vedi tutti</Text>
          </Pressable>
        </View>     

        {/* Card “last saved” */}
      {/* ✅ Se esiste lastSpot: mostra card */}
      {lastSpot ? (
        <>
          <Pressable
            style={styles.lastCard}
            onPress={() =>
              router.push({
                pathname: "/detail",
                params: { id: lastSpot.id },
              })
            }
          >
            <View style={styles.lastLeft}>
              <Text style={styles.pinEmoji}>📍</Text>

              <View>
                <Text style={styles.place}>
                  {lastSpot.title ?? "Posto salvato"}
                </Text>

                <Text style={styles.time}>
                  {new Date(lastSpot.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.lastRight}>
              <Text style={styles.ctaText}>Portami lì</Text>
            </View>
          </Pressable>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <Pressable
              style={styles.actionPill}
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: { id: lastSpot.id, mode: "edit" },
                })
              }
            >
              <Text style={styles.actionText}>Modifica</Text>
            </Pressable>

            <Pressable
              style={[styles.actionPill, styles.actionPrimary]}
              onPress={() => handleOpenMaps(lastSpot)}
            >
              <Text style={[styles.actionText, styles.actionPrimaryText]}>
                Apri mappa
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        /* ✅ Empty state: quando non c’è ancora nulla */
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nessun posto salvato</Text>
          <Text style={styles.emptyText}>
            Premi il bottone sopra per segnare un luogo e tornarci quando vuoi.
          </Text>
        </View>
      )}
    </View>
  </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { marginTop: 24, fontSize: 18, fontWeight: "600", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280" },
  bottomSheet: {
  paddingTop: 10,
  paddingHorizontal: 16,
  paddingBottom: 18,
  backgroundColor: "rgba(255,255,255,0.92)",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,

  // Shadow “floating”
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: -10 },
  elevation: 18,

  borderTopWidth: 1,
  borderColor: "rgba(0,0,0,0.06)",
},

sheetHandle: {
  alignSelf: "center",
  width: 44,
  height: 5,
  borderRadius: 999,
  backgroundColor: "rgba(17,24,39,0.12)",
  marginBottom: 12,
},

sheetHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},

sheetLabel: {
  fontSize: 12,
  letterSpacing: 0.8,
  color: "#9CA3AF",
  fontWeight: "700",
},

pinEmoji: {
  fontSize: 16,       // aumenta/diminuisci
  marginRight: 8,
  marginTop: 1,       // micro-allineamento verticale
},

sheetLink: {
  fontSize: 13,
  color: "#2563EB",
  fontWeight: "600",
},

lastCard: {
  backgroundColor: "white",
  borderRadius: 20,
  paddingVertical: 14,
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 10,

  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.06)",
},

lastLeft: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

lastIcon: {
  width: 36,
  height: 36,
  borderRadius: 12,
  backgroundColor: "rgba(37,99,235,0.12)",
},

place: {
  fontSize: 16,
  fontWeight: "700",
  color: "#111827",
},

time: {
  marginTop: 4,
  fontSize: 13,
  color: "#6B7280",
  fontWeight: "500",
},

lastRight: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "rgba(37,99,235,0.10)",
},

ctaText: {
  color: "#2563EB",
  fontWeight: "700",
  fontSize: 13,
},

actionsRow: {
  marginTop: 12,
  flexDirection: "row",
  gap: 10,
},

actionPill: {
  flex: 1,
  height: 44,
  borderRadius: 999,
  backgroundColor: "rgba(17,24,39,0.06)",
  alignItems: "center",
  justifyContent: "center",
},

actionText: {
  fontWeight: "700",
  color: "#111827",
},

actionPrimary: {
  backgroundColor: "#111827",
},

actionPrimaryText: {
  color: "white",
},
emptyCard: {
  backgroundColor: "white",
  borderRadius: 20,
  paddingVertical: 14,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.06)",
},

emptyTitle: {
  fontSize: 15,
  fontWeight: "700",
  color: "#111827",
},

emptyText: {
  marginTop: 6,
  fontSize: 13,
  color: "#6B7280",
  lineHeight: 18,
}

});
