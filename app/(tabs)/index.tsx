import AnchorButton from "@/components/AnchorButton";
import Pin3DButton from "@/components/Pin3DButton";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  ActionSheetIOS,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";


import { useRouter, Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import React, { useCallback, useState } from "react";
import { Spot } from "@/types/Spot";
import { getLastSpot, saveSpot } from "@/storage/SpotStorage";
import {
  requestLocationPermission,
  getCurrentPositionBalanced,
  getAddressLabel,
} from "@/services/locationService";


export default function HomeScreen() {
  const router = useRouter();

   const [lastSpot, setLastSpot] = useState<Spot | null>(null);
   const [NamePosition, setNamePosition] = useState(false);
   const [draftTitle, setDraftTitle] = useState("");
   const [pendingSpot, setPendingSpot] = useState<Spot | null>(null);

   const handleOpenMaps = async (spot: Spot) => {
    const lat = spot.lat;
    const lng = spot.lng;

    const appleMapsUrl = `http://maps.apple.com/?q=${encodeURIComponent(
      `${lat},${lng}`
    )}`;
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lng}`
    )}`;
    const googleIosUrl = `comgooglemaps://?q=${encodeURIComponent(
      `${lat},${lng}`
    )}`;
    const googleAndroidUrl = `geo:${lat},${lng}?q=${encodeURIComponent(
      `${lat},${lng}`
    )}`;

    try {
      if (Platform.OS === "ios") {
        const canGoogle = await Linking.canOpenURL(googleIosUrl);

        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: [
              "Apri in Google Maps",
              "Apri in Mappe",
              "Annulla",
            ],
            cancelButtonIndex: 2,
          },
          async (buttonIndex) => {
            try {
              if (buttonIndex === 0) {
                await Linking.openURL(canGoogle ? googleIosUrl : googleUrl);
              } else if (buttonIndex === 1) {
                await Linking.openURL(appleMapsUrl);
              }
            } catch (e: any) {
              Alert.alert("Errore", e?.message ?? "Impossibile aprire la mappa.");
            }
          }
        );
        return;
      }

      // Android: show chooser
      Alert.alert("Apri mappa", "Scegli l’app", [
        {
          text: "Google Maps",
          onPress: async () => {
            const canGeo = await Linking.canOpenURL(googleAndroidUrl);
            await Linking.openURL(canGeo ? googleAndroidUrl : googleUrl);
          },
        },
        {
          text: "Browser",
          onPress: async () => {
            await Linking.openURL(googleUrl);
          },
        },
        { text: "Annulla", style: "cancel" },
      ]);
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile aprire la mappa.");
    }
  };

   const handleShare = async (spot: Spot) => {
    try {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${spot.lat},${spot.lng}`
      )}`;
      const message = spot.title?.trim()
        ? `${spot.title}\n${url}`
        : url;
      await Share.share({ message });
    } catch (e: any) {
      Alert.alert("Errore", e?.message ?? "Impossibile condividere la posizione.");
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

        const pos = await getCurrentPositionBalanced();

        const spot: Spot = {
          id: Crypto.randomUUID(),
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy ?? undefined,
          createdAt: new Date().toISOString(),
          title: "Posto salvato", // per ora placeholder
          addressLabel: undefined,
        };

        await saveSpot(spot);
        setLastSpot(spot);

        // Open modal for set the name of position
        setPendingSpot(spot);
        setDraftTitle("");
        setNamePosition(true);

        // Resolve address in background and update when ready
        (async () => {
          const label = await getAddressLabel(spot.lat, spot.lng);
          if (!label) return;
          const updated: Spot = { ...spot, addressLabel: label };
          await saveSpot(updated);
          setLastSpot((prev) => (prev?.id === updated.id ? updated : prev));
          setPendingSpot((prev) => (prev?.id === updated.id ? updated : prev));
        })();
      }
      catch(e: any){
        Alert.alert("Errore", e?.message ?? "Impossibile salvare la posizione.");
      }
    }

    const closeRename = () => {
      setNamePosition(false);
      setPendingSpot(null);
      setDraftTitle("");
    };

    const confirmRename = async () => {
      if (!pendingSpot) return;

      const title = draftTitle.trim() ? draftTitle.trim() : "Posto salvato";
      const updated: Spot = { ...pendingSpot, title };

      await saveSpot(updated);     // ✅ aggiorna lo spot salvato (stesso id)
      setLastSpot(updated);

      closeRename();


      // opzionale: vai subito al dettaglio per editare altro
      // router.push({ pathname: "/detail", params: { id: updated.id, mode: "edit" } });
    };

  return (
    <View style={styles.container}>
      <Modal
      visible={NamePosition}
      transparent
      animationType="fade"
      onRequestClose={closeRename}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Dai un nome al posto</Text>
          <Text style={styles.modalSubtitle}>Così lo ritrovi subito nello storico.</Text>

          <TextInput
            value={draftTitle}
            onChangeText={setDraftTitle}
            placeholder="Es. Bar Centrale"
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={confirmRename}
            style={styles.modalInput}
          />

          <View style={styles.modalActions}>
            <Pressable onPress={closeRename} style={styles.modalBtn}>
              <Text style={styles.modalBtnText}>Più tardi</Text>
            </Pressable>

            <Pressable onPress={confirmRename} style={[styles.modalBtn, styles.modalBtnPrimary]}>
              <Text style={[styles.modalBtnText, styles.modalBtnPrimaryText]}>Salva</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
                params: { id: lastSpot.id, title: lastSpot.title },
              })
            }
          >
            <View style={styles.lastLeft}>
              <Text style={styles.pinEmoji}>📍</Text>

              <View>
                <Text style={styles.place}>
                  {lastSpot.title?.trim() ? lastSpot.title : "Posto salvato"}
                </Text>

                {lastSpot.addressLabel ? (
                  <Text style={styles.placeAddress} numberOfLines={1}>
                    {lastSpot.addressLabel}
                  </Text>
                ) : null}

                <Text style={styles.time}>
                  {new Date(lastSpot.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.lastRight}>
              <Pressable
                style={[styles.ctaPill, styles.ctaSecondary, styles.ctaIconPill]}
                onPress={() => handleShare(lastSpot)}
                accessibilityLabel="Condividi posizione"
              >
                <Ionicons name="share-outline" size={16} color="#111827" />
              </Pressable>
            </View>
          </Pressable>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            {/*<Pressable
              style={styles.actionPill}
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: { id: lastSpot.id, mode: "edit"},
                })
              }
            >
              <Text style={styles.actionText}>Modifica</Text>
            </Pressable>*/}

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
placeAddress: {
  marginTop: 2,
  fontSize: 10,
  color: "#6B7280",
},

time: {
  marginTop: 4,
  fontSize: 10,
  color: "#6B7280",
  fontWeight: "500",
},

lastRight: {
  flexDirection: "row",
  gap: 8,
},

ctaText: {
  color: "#2563EB",
  fontWeight: "700",
  fontSize: 13,
},

ctaPill: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderRadius: 999,
  backgroundColor: "rgba(37,99,235,0.10)",
},

ctaSecondary: {
  backgroundColor: "rgba(17,24,39,0.06)",
},

ctaIconPill: {
  paddingHorizontal: 10,
},

actionsRow: {
  marginTop: 12,
  flexDirection: "row",
  gap: 10,
},

actionPill: {
  flex: 1,
  height: 54,
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
},
modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.35)",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
},
modalCard: {
  width: "100%",
  maxWidth: 420,
  backgroundColor: "#fff",
  borderRadius: 22,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(0,0,0,0.06)",
},
modalTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
modalSubtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", fontWeight: "600" },
modalInput: {
  marginTop: 12,
  height: 48,
  borderRadius: 14,
  paddingHorizontal: 12,
  backgroundColor: "rgba(17,24,39,0.04)",
  color: "#111827",
  fontWeight: "700",
},
modalActions: { marginTop: 14, flexDirection: "row", gap: 10 },
modalBtn: {
  flex: 1,
  height: 46,
  borderRadius: 999,
  backgroundColor: "rgba(17,24,39,0.06)",
  alignItems: "center",
  justifyContent: "center",
},
modalBtnPrimary: { backgroundColor: "#111827" },
modalBtnText: { fontWeight: "800", color: "#111827" },
modalBtnPrimaryText: { color: "white" },


});
