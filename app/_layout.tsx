import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../lib/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Handle notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const result = notificationService.handleNotificationResponse(response);
      if (result) {
        // Navigate to content based on notification data
        console.log('Navigate to:', result);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}