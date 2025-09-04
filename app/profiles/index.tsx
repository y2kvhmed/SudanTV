import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ProfilesScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
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
      setProfiles(data || []);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectProfile = async (profileId) => {
    try {
      await supabase.auth.updateUser({
        data: { selected_profile_id: profileId }
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Error', 'Failed to select profile');
    }
  };

  const deleteProfile = async (profileId) => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', profileId);

              if (error) throw error;
              setProfiles(prev => prev.filter(p => p.id !== profileId));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete profile');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Profiles...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Who's Watching?</Text>
        
        <View style={styles.profilesGrid}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileCard}
              onPress={() => selectProfile(profile.id)}
            >
              <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.defaultAvatar]}>
                    <Ionicons name="person" size={40} color="#FFFAE5" />
                  </View>
                )}
                {profile.is_child && (
                  <View style={styles.childBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              {!profile.is_primary && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteProfile(profile.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF4444" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ))}
          
          {profiles.length < 5 && (
            <TouchableOpacity
              style={[styles.profileCard, styles.addProfileCard]}
              onPress={() => router.push('/profiles/create')}
            >
              <View style={[styles.avatar, styles.addAvatar]}>
                <Ionicons name="add" size={40} color="#FFFAE5" />
              </View>
              <Text style={styles.profileName}>Add Profile</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => router.push('/profiles/manage')}
        >
          <Ionicons name="settings" size={20} color="#FFFAE5" />
          <Text style={styles.manageButtonText}>Manage Profiles</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFAE5',
    textAlign: 'center',
    marginBottom: 40,
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
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAvatar: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFAE5',
    borderStyle: 'dashed',
  },
  childBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  addProfileCard: {
    opacity: 0.7,
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    gap: 8,
  },
  manageButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '500',
  },
});