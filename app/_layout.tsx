// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = { anchor: "(tabs)" };

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {/* Tabs: niente header (quindi Home senza header) */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Explore come pagina stack con header+back */}
          <Stack.Screen
            name="explore"
            options={{
              title: "Storico luoghi",
              headerShown: true,
              headerBackTitle: "Indietro"
            }}
          />

          {/* Detail con header+back */}
          <Stack.Screen
            name="detail"
            options={{
              title: "Dettaglio",
              headerShown: true,
              headerBackTitle: "Indietro"
            }}
          />

          <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
          <Stack.Screen name="history" options={{ title: "Storico" }} />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
