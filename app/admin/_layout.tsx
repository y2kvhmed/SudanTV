import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useEnhancedStore } from '../../lib/enhanced-store';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const router = useRouter();
  const { user } = useEnhancedStore();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.replace('/');
      return;
    }

    if (user.email?.toLowerCase() !== 'bedaya.sdn@gmail.com') {
      router.replace('/(tabs)/home');
      return;
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add-content" />
      <Stack.Screen name="manage-content" />
      <Stack.Screen name="add-season" />
      <Stack.Screen name="add-episode" />
    </Stack>
  );
}