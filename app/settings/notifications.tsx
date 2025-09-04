import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../lib/notifications';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    new_content: true,
    new_episodes: true,
    recommendations: true,
  });
  const [loading, setLoading] = useState(true);
  const [pushToken, setPushToken] = useState(null);

  useEffect(() => {
    loadSettings();
    setupNotifications();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id;
      
      if (profileId) {
        const { data, error } = await supabase
          .from('notification_settings')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setSettings({
            new_content: data.new_content,
            new_episodes: data.new_episodes,
            recommendations: data.recommendations,
          });
          setPushToken(data.push_token);
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id;
      
      if (profileId) {
        const token = await notificationService.registerForPushNotifications(profileId);
        setPushToken(token);
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id || user?.id;
      
      if (profileId) {
        const { error } = await supabase
          .from('notification_settings')
          .update({ [key]: value })
          .eq('profile_id', profileId);
          
        if (error && error.code === 'PGRST116') {
          // Record doesn't exist, insert it
          const { error: insertError } = await supabase
            .from('notification_settings')
            .insert({
              profile_id: profileId,
              [key]: value,
              new_content: key === 'new_content' ? value : true,
              new_episodes: key === 'new_episodes' ? value : true,
              recommendations: key === 'recommendations' ? value : true
            });
          if (insertError) throw insertError;
        } else if (error) {
          throw error;
        }
          
        if (error) throw error;
        setSettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error updating notification setting:', error);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const testNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id;
      
      if (profileId) {
        await notificationService.sendNotification(
          profileId,
          'Test Notification',
          'This is a test notification from Sudan TV!'
        );
        Alert.alert('Success', 'Test notification sent!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const SettingItem = ({ title, description, value, onValueChange }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#FFFAE5' }}
        thumbColor={value ? '#000' : '#FFFAE5'}
      />
    </View>
  );

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          
          <SettingItem
            title="New Content"
            description="Get notified when new movies, series, or shows are added"
            value={settings.new_content}
            onValueChange={(value) => updateSetting('new_content', value)}
          />
          
          <SettingItem
            title="New Episodes"
            description="Get notified when new episodes of your favorite shows are available"
            value={settings.new_episodes}
            onValueChange={(value) => updateSetting('new_episodes', value)}
          />
          
          <SettingItem
            title="Recommendations"
            description="Get personalized content recommendations"
            value={settings.recommendations}
            onValueChange={(value) => updateSetting('recommendations', value)}
          />
        </View>



        {pushToken && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Device Status</Text>
            <View style={styles.statusItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>Push notifications enabled</Text>
            </View>
          </View>
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#999',
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  testButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '500',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
  },
});