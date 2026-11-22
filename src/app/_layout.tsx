import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppColors } from '@/constants/colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: AppColors.navy },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="add" />
      </Stack>
    </>
  );
}
