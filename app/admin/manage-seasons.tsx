import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ManageSeasonsScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams();
  const [seasons, setSeasons] = useState([]);
  const [contentTitle, setContentTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeasons();
    loadContentTitle();
  }, []);

  const loadContentTitle = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('title')
        .eq('id', contentId)
        .single();

      if (error) throw error;
      setContentTitle(data.title);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('content_id', contentId)
        .order('season_number');

      if (error) throw error;
      setSeasons(data || []);
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSeason = async (id) => {
    Alert.alert(
      'Delete Season',
      'Are you sure you want to delete this season?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('seasons')
                .delete()
                .eq('id', id);

              if (error) throw error;
              loadSeasons();
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
        <Text style={styles.title}>{contentTitle} - Seasons</Text>
      </View>

      <View style={styles.addButton}>
        <TouchableOpacity 
          style={styles.addSeasonButton}
          onPress={() => router.push(`/admin/add-season?contentId=${contentId}`)}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.addSeasonText}>Add Season</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.seasonsList}>
        {seasons.map((season) => (
          <View key={season.id} style={styles.seasonItem}>
            <View style={styles.seasonInfo}>
              <Text style={styles.seasonTitle}>Season {season.season_number}</Text>
              <Text style={styles.seasonSubtitle}>{season.title}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.episodeButton}
                onPress={() => router.push(`/admin/manage-episodes?seasonId=${season.id}`)}
              >
                <Ionicons name="play-circle" size={16} color="#FFFAE5" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDeleteSeason(season.id)}
              >
                <Ionicons name="trash" size={16} color="#ff4444" />
              </TouchableOpacity>
            </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  addButton: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addSeasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAE5',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addSeasonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  seasonsList: {
    paddingHorizontal: 20,
  },
  seasonItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  seasonInfo: {
    flex: 1,
  },
  seasonTitle: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  seasonSubtitle: {
    color: '#999',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  episodeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
  },
});