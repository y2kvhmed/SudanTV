import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { pickAndUploadImage } from '../../../lib/image-upload';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setName(data.name);
      setAvatarUrl(data.avatar_url || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: name.trim(),
          avatar_url: avatarUrl
        })
        .eq('id', id);

      if (error) throw error;
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      setUploading(true);
      const url = await pickAndUploadImage('avatars');
      if (url) {
        setAvatarUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarUpload} disabled={uploading}>
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
            {uploading ? 'Uploading...' : 'Tap to change avatar'}
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter profile name"
            placeholderTextColor="#666"
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  backButton: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFAE5' },
  content: { flex: 1, paddingHorizontal: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 40 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  defaultAvatar: { backgroundColor: 'rgba(255, 250, 229, 0.1)', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 12, right: 0, backgroundColor: '#FFFAE5', borderRadius: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#999', fontSize: 14, textAlign: 'center' },
  form: { marginBottom: 40 },
  label: { color: '#FFFAE5', fontSize: 16, marginBottom: 8 },
  input: { backgroundColor: 'rgba(255, 250, 229, 0.1)', borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#FFFAE5', fontSize: 16 },
  saveButton: { backgroundColor: '#FFFAE5', paddingVertical: 16, borderRadius: 12 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#000', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});