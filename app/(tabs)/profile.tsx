import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();
  const [currentProfile, setCurrentProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      setAllProfiles(data || []);
      
      const selectedProfileId = user.user_metadata?.selected_profile_id;
      const current = data?.find(p => p.id === selectedProfileId) || data?.[0];
      setCurrentProfile(current);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchProfile = () => {
    router.push('/profiles');
  };

  const logout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/');
          }
        }
      ]
    );
  };

  const profileOptions = [
    { title: 'Switch Profile', icon: 'people', action: switchProfile },
    { title: 'Notification Settings', icon: 'notifications', action: () => router.push('/settings/notifications') },
    { title: 'My Lists', icon: 'heart', action: () => router.push('/(tabs)/mylist') },
    { title: 'Continue Watching', icon: 'play-circle', action: () => router.push('/(tabs)/continue-watching') },
  ];

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            {currentProfile?.avatar_url ? (
              <Image source={{ uri: currentProfile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <Ionicons name="person" size={40} color="#FFFAE5" />
              </View>
            )}
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{currentProfile?.name || 'User'}</Text>
              <Text style={styles.profileType}>
                {currentProfile?.is_child ? 'Child Profile' : 'Profile'}
              </Text>

            </View>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionItem}
              onPress={option.action}
            >
              <View style={styles.optionLeft}>
                <Ionicons name={option.icon} size={24} color="#FFFAE5" />
                <Text style={styles.optionText}>{option.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.optionItem} onPress={logout}>
            <View style={styles.optionLeft}>
              <Ionicons name="log-out" size={24} color="#ff4444" />
              <Text style={[styles.optionText, { color: '#ff4444' }]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: '#FFFAE5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileType: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  profileCount: {
    color: '#666',
    fontSize: 12,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFAE5',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    color: '#FFFAE5',
    fontSize: 16,
    marginLeft: 16,
  },
});