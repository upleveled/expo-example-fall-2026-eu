import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { colors } from '@/constants/theme.ts';

SplashScreen.preventAutoHideAsync().catch((splashScreenError) => {
  console.error(
    'Failed to prevent splash screen auto hide:',
    splashScreenError,
  );
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch((splashScreenError) => {
        console.error('Failed to hide splash screen:', splashScreenError);
      });
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={false} redirectTo="/animals">
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="animals/new"
        options={{
          title: 'New Animal',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="animals/[animalId]"
        options={{
          title: 'Animal',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="notes/newNote"
        options={{
          title: 'New Note',
          presentation: 'modal',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
      <Stack.Screen
        name="notes/[noteId]"
        options={{
          title: 'Note',
          presentation: 'modal',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
        }}
      />
    </Stack>
  );
}
