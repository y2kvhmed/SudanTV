import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function SeasonDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [season, setSeason] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeason();
    loadEpisodes();
  }, []);

  const loadSeason = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const { data: content } = await supabase
        .from('content')
        .select('title, backdrop_url')
        .eq('id', data.content_id)
        .single();

      setSeason({ ...data, content });
    } catch (error) {
      console.error('Error loading season:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', id)
        .order('episode_number');

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
    }
  };

  if (loading || !season) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
      </View>

      <Image 
        source={{ 
          uri: season.content?.backdrop_url || season.poster_url || 'https://via.placeholder.com/400x200/333/fff'
        }} 
        style={styles.backdrop}
      />

      <View style={styles.seasonInfo}>
        <Text style={styles.showTitle}>{season.content?.title}</Text>
        <Text style={styles.seasonTitle}>Season {season.season_number}: {season.title}</Text>
        {season.description && (
          <Text style={styles.description}>{season.description}</Text>
        )}

        <View style={styles.episodesContainer}>
          <Text style={styles.episodesTitle}>Episodes</Text>
          {episodes.map((episode) => (
            <TouchableOpacity
              key={episode.id}
              style={styles.episodeItem}
              onPress={() => router.push(`/player/${episode.id}?type=episode`)}
            >
              <Image 
                source={{ 
                  uri: episode.thumbnail_url || 'https://via.placeholder.com/120x80/333/fff'
                }} 
                style={styles.episodeThumbnail}
              />
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle}>
                  {episode.episode_number}. {episode.title}
                </Text>
                <Text style={styles.episodeDescription} numberOfLines={2}>
                  {episode.description || 'No description available'}
                </Text>
                {episode.duration && (
                  <Text style={styles.episodeDuration}>{episode.duration} min</Text>
                )}
              </View>
              <Ionicons name="play-circle" size={32} color="#FFFAE5" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  backdrop: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  seasonInfo: {
    padding: 20,
  },
  showTitle: {
    color: '#999',
    fontSize: 16,
    marginBottom: 4,
  },
  seasonTitle: {
    color: '#FFFAE5',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    color: '#FFFAE5',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  episodesContainer: {
    marginTop: 20,
  },
  episodesTitle: {
    color: '#FFFAE5',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  episodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  episodeThumbnail: {
    width: 120,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeDescription: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  episodeDuration: {
    color: '#666',
    fontSize: 12,
  },
});