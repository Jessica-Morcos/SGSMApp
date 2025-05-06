
import { Stack } from 'expo-router';
import './globals.css';

export default function RootLayout() {
  return (
    <Stack
      initialRouteName="(tabs)"
      screenOptions={{
        headerShown: false, 
      }}
    >
     <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      
      <Stack.Screen
        name="announcements/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="announcements/[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
