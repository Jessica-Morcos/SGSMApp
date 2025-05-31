// app/_layout.tsx
import { Stack } from 'expo-router';
import './globals.css';

export default function RootLayout() {
  return (
    <Stack
      // Remove initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* 1. Register the splash (index) as the first screen */}
      <Stack.Screen
        name="index"               // This points to app/index.tsx
        options={{ headerShown: false, animation: 'none' }}
      />

      {/* 2. Now register your tab navigator */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />

      {/* 3. Register announcements routes (unchanged) */}
      <Stack.Screen
        name="announcements/index"
        options={{ headerShown: false, animation: 'none' }}
      />
      <Stack.Screen
        name="announcements/[id]"
        options={{ headerShown: false, animation: 'none' }}
      />
    </Stack>
  );
}
