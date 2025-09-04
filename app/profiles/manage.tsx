import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ManageProfilesScreen() {
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
              // Check if it's not a primary profile
              const profile = profiles.find(p => p.id === profileId);
              if (profile?.is_primary) {
                Alert.alert('Error', 'Cannot delete primary profile');
                return;
              }
              
              // Delete the profile directly
              const { error } = await supabase
                .from('user_profiles')
                .delete()
                .eq('id', profileId);

              if (error) {
                console.error('Delete error:', error);
                Alert.alert('Error', `Failed to delete profile: ${error.message}`);
                return;
              }
              
              // Update local state immediately
              setProfiles(prev => prev.filter(p => p.id !== profileId));
              Alert.alert('Success', 'Profile deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete profile');
            }
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Profiles</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profilesGrid}>
          {profiles.map((profile) => (
            <View key={profile.id} style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.defaultAvatar]}>
                    <Ionicons name="person" size={40} color="#FFFAE5" />
                  </View>
                )}

              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileType}>
                {profile.is_primary ? 'Primary' : 'Profile'}
              </Text>
              
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push(`/profiles/edit/${profile.id}`)}
                >
                  <Ionicons name="pencil" size={16} color="#FFFAE5" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                {!profile.is_primary && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteProfile(profile.id)}
                  >
                    <Ionicons name="trash" size={16} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
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
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFAE5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  profileCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  addProfileCard: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#333',
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

  profileName: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileType: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  editButtonText: {
    color: '#FFFAE5',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 6,
    padding: 6,
  },
});