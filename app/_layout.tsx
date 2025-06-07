// app/_layout.tsx
import { Stack } from 'expo-router';
import './globals.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"               // This points to app/index.tsx
        options={{ headerShown: false, animation: 'none' }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          animation: 'none',
        }}
      />

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
