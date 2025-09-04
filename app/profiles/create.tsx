import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { pickAndUploadImage } from '../../lib/image-upload';
import { Ionicons } from '@expo/vector-icons';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a profile name');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          name: name.trim(),
          avatar_url: avatarUrl,
          is_child: isChild,
          is_primary: false
        });

      if (error) throw error;

      Alert.alert('Success', 'Profile created successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      setUploadingAvatar(true);
      const url = await pickAndUploadImage('avatars');
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Profile</Text>
        
        <View style={styles.form}>
          <View style={styles.avatarSection}>
            <TouchableOpacity 
              style={styles.avatarButton}
              onPress={handleAvatarUpload}
              disabled={uploadingAvatar}
            >
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.defaultAvatar]}>
                  <Ionicons name="person" size={40} color="#FFFAE5" />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#FFFAE5" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarText}>
              {uploadingAvatar ? 'Uploading...' : 'Tap to add photo'}
            </Text>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Profile Name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
          
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Child Profile</Text>
              <Text style={styles.switchDescription}>
                Restricted content and parental controls
              </Text>
            </View>
            <Switch
              value={isChild}
              onValueChange={setIsChild}
              trackColor={{ false: '#333', true: '#FFFAE5' }}
              thumbColor={isChild ? '#000' : '#FFFAE5'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateProfile}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create Profile'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 50,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFAE5',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarButton: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  defaultAvatar: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 0,
    backgroundColor: '#FFFAE5',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFAE5',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '500',
  },
  switchDescription: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  createButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 16,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});