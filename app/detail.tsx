import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Linking
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { deleteSpot, getSpotList, saveSpot } from "@/storage/SpotStorage";

type Spot = {
  id: string;
  title?: string;
  note?: string;
  createdAt: string; // ISO
  lat: number;
  lng: number;
  accuracy?: number;
  addressLabel?: string;
};

export default function DetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; mode?: string }>();

  const initialSpot: Spot = {
    id: params.id ?? "mock-id",
    title: "Bar Centrale",
    note: "Tavolini fuori, ottimi cappuccini.",
    createdAt: new Date().toISOString(),
    lat: 45.464211,
    lng: 9.191383,
    accuracy: 12,
    addressLabel: "Via Example 12, Milano",
  };

  const [spot, setSpot] = useState<Spot>(initialSpot);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        if (!params.id) return;
        const list = await getSpotList();
        const found = list.find((s) => s.id === params.id);
        if (isActive && found) {
          setSpot(found);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [params.id])
  );

  const latLngLabel = useMemo(() => {
    const lat = spot.lat.toFixed(6);
    const lng = spot.lng.toFixed(6);
    return `${lat}, ${lng}`;
  }, [spot.lat, spot.lng]);

  const handleSave = async () => {
    try {
      await saveSpot(spot);
      Alert.alert("Salvato", "Modifiche salvate.");
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile salvare le modifiche.");
    }
  };

  const handleDelete = () => {
  Alert.alert(
    "Eliminare questo posto?",
    "L’azione è definitiva e rimuoverà la posizione dallo storico.",
    [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSpot(spot.id);
            Alert.alert("Eliminato", "Posizione eliminata.");
            router.back();
          } catch (e: any) {
            Alert.alert("Errore", e?.message ?? "Impossibile eliminare la posizione.");
          }
        },
      },
    ]
  );
};


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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>SALVATO</Text>
          </View>
        </View>

        {/* Title editable */}
        <View style={styles.titleRow}>
          {isEditingTitle ? (
            <TextInput
              value={spot.title ?? ""}
              onChangeText={(t) => setSpot((s) => ({ ...s, title: t }))}
              placeholder="Nome del posto"
              placeholderTextColor="#9CA3AF"
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              style={styles.titleInput}
              returnKeyType="done"
              onSubmitEditing={() => setIsEditingTitle(false)}
            />
          ) : (
            <Text style={styles.title} numberOfLines={2}>
              {spot.title?.trim() ? spot.title : "Posto salvato"}
            </Text>
          )}

          <View style={styles.actionsInline}>
          <Pressable onPress={() => setIsEditingTitle(true)} style={styles.editPill}>
            <Text style={styles.editPillText}>Modifica</Text>
          </Pressable>

          <Pressable onPress={handleDelete} style={styles.deletePill}>
            <Text style={styles.deletePillText}>Elimina</Text>
          </Pressable>
        </View>
        </View>

        {/* Address (optional) */}
        {spot.addressLabel ? (
          <Text style={styles.address} numberOfLines={2}>
            {spot.addressLabel}
          </Text>
        ) : (
          <Text style={styles.addressMuted}>Nessun indirizzo disponibile</Text>
        )}

        {/* Chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>COORDINATE</Text>
            <Text style={styles.chipValue}>{latLngLabel}</Text>
          </View>

          <View style={styles.chip}>
            <Text style={styles.chipLabel}>ACCURACY</Text>
            <Text style={styles.chipValue}>
              {spot.accuracy != null ? `${Math.round(spot.accuracy)} m` : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* NOTE CARD */}
      <View style={styles.noteCard}>
        <Text style={styles.sectionTitle}>Nota</Text>
        <Text style={styles.sectionHint}>Aggiungi un dettaglio che ti aiuti a riconoscerlo.</Text>

        <TextInput
          value={spot.note ?? ""}
          onChangeText={(t) => setSpot((s) => ({ ...s, note: t }))}
          placeholder="Es. ingresso a sinistra, insegna verde…"
          placeholderTextColor="#9CA3AF"
          multiline
          style={styles.noteInput}
        />
      </View>

      {/* Bottom actions */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.secondaryBtn} onPress={() => handleOpenMaps(spot)}>
          <Text style={styles.secondaryText}>Apri mappe</Text>
        </Pressable>

        <Pressable style={styles.primaryBtn} onPress={handleSave}>
          <Text style={styles.primaryText}>Salva</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F9FAFB" },

  heroCard: {
    marginTop: 10,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.10)",
  },
  badgeText: { color: "#2563EB", fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },

  titleRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: { flex: 1, fontSize: 22, fontWeight: "900", color: "#111827" },
  titleInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(17,24,39,0.04)",
  },
  editPill: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.06)",
  },
  editPillText: { fontWeight: "800", color: "#111827", fontSize: 13 },

  address: { marginTop: 8, color: "#374151", fontWeight: "600" },
  addressMuted: { marginTop: 8, color: "#9CA3AF", fontWeight: "600" },

  chipsRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  chip: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(17,24,39,0.04)",
  },
  chipLabel: { fontSize: 11, color: "#6B7280", fontWeight: "800", letterSpacing: 0.6 },
  chipValue: { marginTop: 6, fontSize: 13, color: "#111827", fontWeight: "800" },

  noteCard: {
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionTitle: { fontSize: 14, fontWeight: "900", color: "#111827" },
  sectionHint: { marginTop: 6, fontSize: 12, color: "#6B7280", fontWeight: "600" },
  noteInput: {
    marginTop: 10,
    minHeight: 110,
    textAlignVertical: "top",
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(17,24,39,0.04)",
    color: "#111827",
    fontWeight: "600",
  },

  bottomBar: {
    marginTop: "auto",
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 12,
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(249,250,251,0.92)",
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontWeight: "900", color: "#111827" },

  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { fontWeight: "900", color: "white" },
  actionsInline: {
  flexDirection: "row",
  gap: 8,
  alignItems: "center",
},

deletePill: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "rgba(239,68,68,0.12)", // red soft
  borderWidth: 1,
  borderColor: "rgba(239,68,68,0.22)",
},

deletePillText: {
  fontWeight: "900",
  color: "#EF4444",
  fontSize: 13,
}
});
