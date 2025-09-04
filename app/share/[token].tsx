import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { sharingService } from '../../lib/sharing';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function SharedContentScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [sharedContent, setSharedContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSharedContent();
  }, [token]);

  const loadSharedContent = async () => {
    try {
      const data = await sharingService.getSharedContent(token as string);
      setSharedContent(data);
    } catch (error) {
      console.error('Error loading shared content:', error);
    } finally {
      setLoading(false);
    }
  };

  const openInApp = () => {
    if (Platform.OS === 'web') {
      window.location.href = `sudantv://content/${sharedContent.content_id}`;
    } else {
      router.push(`/content/${sharedContent.content_id}`);
    }
  };

  const downloadApp = () => {
    if (Platform.OS === 'web') {
      window.open('https://play.google.com/store/apps/details?id=com.bedaya.sudantv', '_blank');
    } else {
      Linking.openURL('https://play.google.com/store/apps/details?id=com.bedaya.sudantv');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!sharedContent) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Content Not Found</Text>
          <TouchableOpacity style={styles.homeButton} onPress={downloadApp}>
            <Text style={styles.homeButtonText}>Download Sudan TV</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const { content } = sharedContent;

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brandTitle}>Sudan TV</Text>
        
        <View style={styles.contentCard}>
          <Image source={{ uri: content.poster_url }} style={styles.poster} />
          <View style={styles.info}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={openInApp}>
          <Text style={styles.primaryButtonText}>Open in Sudan TV</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={downloadApp}>
          <Text style={styles.secondaryButtonText}>Download App</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20, justifyContent: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#FFFAE5', fontSize: 18 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorTitle: { color: '#FFFAE5', fontSize: 24, marginBottom: 20 },
  brandTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFFAE5', textAlign: 'center', marginBottom: 40 },
  contentCard: { flexDirection: 'row', backgroundColor: 'rgba(255,250,229,0.1)', borderRadius: 12, padding: 16, marginBottom: 30 },
  poster: { width: 80, height: 120, borderRadius: 8, marginRight: 16 },
  info: { flex: 1 },
  title: { color: '#FFFAE5', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { color: '#999', fontSize: 14 },
  primaryButton: { backgroundColor: '#FFFAE5', padding: 16, borderRadius: 8, marginBottom: 12 },
  primaryButtonText: { color: '#000', fontSize: 16, fontWeight: '600', textAlign: 'center' },
  secondaryButton: { borderWidth: 1, borderColor: '#FFFAE5', padding: 16, borderRadius: 8 },
  secondaryButtonText: { color: '#FFFAE5', fontSize: 16, textAlign: 'center' },
  homeButton: { backgroundColor: '#FFFAE5', padding: 16, borderRadius: 8 },
  homeButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
});