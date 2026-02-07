import * as Location from "expo-location";

//User permissions
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

export async function getCurrentPositionHigh() {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
}

export async function getCurrentPositionBalanced() {
  return await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}

export async function getAddressLabel(
  lat: number,
  lng: number
): Promise<string | undefined> {
  const results = await Location.reverseGeocodeAsync({
    latitude: lat,
    longitude: lng,
  });

  const a = results?.[0];
  if (!a) return undefined;

  const line1 = [a.street, a.streetNumber].filter(Boolean).join(" ").trim();
  const line2 = [a.postalCode, a.city].filter(Boolean).join(" ").trim();
  const line3 = [a.region, a.country].filter(Boolean).join(", ").trim();

  const fullAddress = [line1, line2, line3].filter(Boolean).join(", ").trim();

  // fallback se reverse geocode non ha street/city
  return fullAddress || (a as any).formattedAddress || undefined;
}
