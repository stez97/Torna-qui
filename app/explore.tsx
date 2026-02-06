import React, { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { deleteSpot, getSpotList } from "@/storage/SpotStorage";
import { Spot } from "@/types/Spot";

export default function explore() {
  const router = useRouter();
  const [spots, setSpots] = useState<Spot[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      (async () => {
        const list = await getSpotList();
        if (isActive) setSpots(list);
      })();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const renderItem = ({ item }: { item: Spot }) => {
    const timeLabel = new Date(item.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

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
              await deleteSpot(item.id);
              setSpots((prev) => prev.filter((s) => s.id !== item.id));
            },
          },
        ]
      );
    };

    const renderLeftActions = () => (
      <View style={styles.leftAction}>
        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>Elimina</Text>
        </Pressable>
      </View>
    );

    return (
      <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false}>
        <Pressable
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/detail",
              params: { id: item.id },
            })
          }
        >
          <View style={styles.cardLeft}>
            <Text style={styles.pinEmoji}>📍</Text>
            <View style={styles.cardText}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title?.trim() ? item.title : "Posto salvato"}
              </Text>
              {item.addressLabel ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.addressLabel}
                </Text>
              ) : null}
            </View>
          </View>
          <Text style={styles.time}>{timeLabel}</Text>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      {spots.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nessun posto salvato</Text>
          <Text style={styles.emptyText}>
            I luoghi che salvi appariranno qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={spots}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB", paddingHorizontal: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  h1: { fontSize: 18, fontWeight: "700", color: "#111827", textAlign: "center", flex: 1 },

  listContent: { paddingTop: 12, paddingBottom: 20, gap: 10 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  pinEmoji: {
    fontSize: 16,       // aumenta/diminuisci
    marginRight: 8,
    marginTop: 1,       // micro-allineamento verticale
  },
  cardText: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#111827" },
  subtitle: { marginTop: 2, fontSize: 12, color: "#6B7280" },
  time: { fontSize: 12, color: "#6B7280", marginLeft: 12 },
  emptyCard: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.06)",
  },
  emptyTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  emptyText: { marginTop: 6, fontSize: 12, color: "#6B7280" },
  leftAction: {
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 6,
  },
  deleteBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
});
