import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id);
          
        if (!profiles || profiles.length === 0) {
          // Create primary profile for new user
          await supabase.from('user_profiles').insert({
            user_id: session.user.id,
            name: session.user.email?.split('@')[0] || 'User',
            is_primary: true
          });
          router.replace('/profiles');
        } else if (profiles.length === 1) {
          // Auto-select single profile
          await supabase.auth.updateUser({
            data: { selected_profile_id: profiles[0].id }
          });
          router.replace('/(tabs)/home');
        } else {
          // Show profile selection
          router.replace('/profiles');
        }
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sudan TV</Text>
        <ActivityIndicator size="large" color="#FFFAE5" style={styles.loader} />
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});