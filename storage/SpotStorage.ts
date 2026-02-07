import AsyncStorage from "@react-native-async-storage/async-storage";
import { Spot } from "@/types/Spot";

const LAST_KEY = "spot:last";
const LIST_KEY = "spot:list";
const MAX_ITEMS = 100;

export async function getLastSpot(): Promise<Spot | null> {
  const raw = await AsyncStorage.getItem(LAST_KEY);
  return raw ? (JSON.parse(raw) as Spot) : null;
}

export async function getSpotList(): Promise<Spot[]> {
  const raw = await AsyncStorage.getItem(LIST_KEY);
  return raw ? (JSON.parse(raw) as Spot[]) : [];
}

export async function saveSpot(spot: Spot): Promise<void> {
  // save "last"
  await AsyncStorage.setItem(LAST_KEY, JSON.stringify(spot));

  // Update list (No dulicates)
  const list = await getSpotList();
  const next = [spot, ...list.filter((s) => s.id !== spot.id)].slice(0, MAX_ITEMS);

  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(next));
}

export async function deleteSpot(spotId: string): Promise<void> {
  const entries = await AsyncStorage.multiGet([LAST_KEY, LIST_KEY]);
  const rawLast = entries[0]?.[1] ?? null;
  const rawList = entries[1]?.[1] ?? null;

  const list = rawList ? (JSON.parse(rawList) as Spot[]) : [];
  const nextList = list.filter((s) => s.id !== spotId);

  await AsyncStorage.setItem(LIST_KEY, JSON.stringify(nextList));

  if (rawLast) {
    const last = JSON.parse(rawLast) as Spot;
    if (last.id === spotId) {
      if (nextList.length > 0) {
        await AsyncStorage.setItem(LAST_KEY, JSON.stringify(nextList[0]));
      } else {
        await AsyncStorage.removeItem(LAST_KEY);
      }
    }
  }
}

export async function clearAllSpots(): Promise<void> {
  await AsyncStorage.multiRemove([LAST_KEY, LIST_KEY]);
}
