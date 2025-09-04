import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { watchProgressService } from '../../lib/watch-progress';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ContinueWatchingScreen() {
  const router = useRouter();
  const [continueWatching, setContinueWatching] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContinueWatching();
  }, []);

  const loadContinueWatching = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id;
      
      if (profileId) {
        const data = await watchProgressService.getContinueWatching(profileId, 50);
        setContinueWatching(data);
      }
    } catch (error) {
      console.error('Error loading continue watching:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (progress, duration) => {
    return Math.min((progress / duration) * 100, 100);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handlePress = (item) => {
    if (item.episode_id) {
      router.push(`/player/${item.episode_id}?type=episode`);
    } else {
      router.push(`/player/${item.content_id}?type=movie`);
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

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
        <Text style={styles.title}>Continue Watching</Text>
      </View>

      <ScrollView style={styles.content}>
        {continueWatching.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="play-circle-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>Nothing to continue</Text>
            <Text style={styles.emptyText}>Start watching something to see it here</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {continueWatching.map((item) => (
              <TouchableOpacity
                key={`${item.content_id}-${item.episode_id || 'movie'}`}
                style={styles.item}
                onPress={() => handlePress(item)}
              >
                <View style={styles.posterContainer}>
                  <Image 
                    source={{ uri: item.content.poster_url }} 
                    style={styles.poster}
                    resizeMode="cover"
                  />
                  <View style={styles.playOverlay}>
                    <Ionicons name="play" size={32} color="#FFFAE5" />
                  </View>
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${getProgressPercentage(item.progress_seconds, item.duration_seconds)}%` }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.info}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {item.content.title}
                  </Text>
                  {item.episodes && (
                    <Text style={styles.episodeTitle} numberOfLines={1}>
                      S{item.episodes.season_number}E{item.episodes.episode_number}: {item.episodes.title}
                    </Text>
                  )}
                  <Text style={styles.progressText}>
                    {formatTime(item.progress_seconds)} / {formatTime(item.duration_seconds)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    color: '#FFFAE5',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  item: {
    width: '48%',
    marginBottom: 20,
  },
  posterContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: 240,
    borderRadius: 8,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFFAE5',
  },
  info: {
    marginTop: 8,
  },
  contentTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  episodeTitle: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  progressText: {
    color: '#666',
    fontSize: 11,
  },
});