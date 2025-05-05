
import { Stack } from 'expo-router';
import './globals.css';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // ← disables that “(tabs)” bar (and any other Stack headers)
      }}
    >
      {/* this will render the (tabs) group */}
      <Stack.Screen name="(tabs)" />

  
    </Stack>
  );
}
