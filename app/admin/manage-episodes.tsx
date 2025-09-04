import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ManageEpisodesScreen() {
  const router = useRouter();
  const { seasonId } = useLocalSearchParams();
  const [episodes, setEpisodes] = useState([]);
  const [seasonInfo, setSeasonInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisodes();
    loadSeasonInfo();
  }, []);

  const loadSeasonInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select(`
          title,
          season_number,
          content_id
        `)
        .eq('id', seasonId)
        .single();

      if (error) throw error;

      const { data: content } = await supabase
        .from('content')
        .select('title')
        .eq('id', data.content_id)
        .single();

      setSeasonInfo({ ...data, content_title: content?.title });
    } catch (error) {
      console.error('Error loading season info:', error);
    }
  };

  const loadEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId)
        .order('episode_number');

      if (error) throw error;
      setEpisodes(data || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEpisode = async (id) => {
    Alert.alert(
      'Delete Episode',
      'Are you sure you want to delete this episode?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('episodes')
                .delete()
                .eq('id', id);

              if (error) throw error;
              loadEpisodes();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
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
        <Text style={styles.title}>
          {seasonInfo?.content_title} - S{seasonInfo?.season_number} Episodes
        </Text>
      </View>

      <View style={styles.addButton}>
        <TouchableOpacity 
          style={styles.addEpisodeButton}
          onPress={() => router.push(`/admin/add-episode?seasonId=${seasonId}`)}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addEpisodeText}>Add Episode</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.episodesList}>
        {episodes.map((episode) => (
          <View key={episode.id} style={styles.episodeItem}>
            <Image 
              source={{ 
                uri: episode.thumbnail_url || 'https://via.placeholder.com/80x60/333/fff?text=E' + episode.episode_number
              }} 
              style={styles.episodeThumbnail}
            />
            <View style={styles.episodeInfo}>
              <Text style={styles.episodeTitle}>
                Episode {episode.episode_number}: {episode.title}
              </Text>
              <Text style={styles.episodeDescription} numberOfLines={2}>
                {episode.description || 'No description'}
              </Text>
              {episode.duration && (
                <Text style={styles.episodeDuration}>{episode.duration} min</Text>
              )}
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteEpisode(episode.id)}
            >
              <Ionicons name="trash" size={16} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addEpisodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAE5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addEpisodeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  episodesList: {
    paddingHorizontal: 20,
  },
  episodeItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  episodeThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#333',
    marginRight: 12,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  episodeDescription: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  episodeDuration: {
    color: '#666',
    fontSize: 11,
  },
  deleteButton: {
    padding: 8,
  },
});