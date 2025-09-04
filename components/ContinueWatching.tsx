import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { watchProgressService } from '../lib/watch-progress';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ContinueWatching() {
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
        const data = await watchProgressService.getContinueWatching(profileId);
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

  if (loading || continueWatching.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Continue Watching</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
                <Ionicons name="play" size={24} color="#FFFAE5" />
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
              <Text style={styles.contentTitle} numberOfLines={1}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  item: {
    width: 160,
    marginRight: 16,
  },
  posterContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: 160,
    height: 240,
    borderRadius: 8,
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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