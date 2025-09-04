import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { userListService } from '../../lib/user-services';
import { sharingService } from '../../lib/sharing';
import i18n from '../../locales';

export default function ContentDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [content, setContent] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInList, setIsInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    if (content) {
      checkIfInList();
    }
  }, [content]);

  const checkIfInList = async () => {
    const inList = await userListService.isInList(content.id);
    setIsInList(inList);
  };

  const toggleList = async () => {
    setListLoading(true);
    try {
      if (isInList) {
        await userListService.removeFromList(content.id);
        setIsInList(false);
      } else {
        await userListService.addToList(content.id);
        setIsInList(true);
      }
    } catch (error) {
      console.error('Error toggling list:', error);
    } finally {
      setListLoading(false);
    }
  };

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setContent(data);

      if (data.type === 'series' || data.type === 'show') {
        loadSeasons();
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('content_id', id)
        .order('season_number');

      if (error) throw error;
      setSeasons(data || []);
    } catch (error) {
      console.error('Error loading seasons:', error);
    }
  };

  if (loading || !content) {
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
          uri: content.backdrop_url || content.poster_url || 'https://via.placeholder.com/400x200/333/fff'
        }} 
        style={styles.backdrop}
      />

      <View style={styles.contentInfo}>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.genre}>{content.genre}</Text>
        <Text style={styles.description}>{content.description}</Text>

        <View style={styles.actionButtons}>
          {content.type === 'movie' && (
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => router.push(`/player/${content.id}?type=movie`)}
            >
              <Ionicons name="play" size={20} color="#000" />
              <Text style={styles.playButtonText}>{i18n.t('playNow')}</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.listButton, isInList && styles.listButtonActive]}
              onPress={toggleList}
              disabled={listLoading}
            >
              <View style={styles.buttonContent}>
                <Ionicons 
                  name={isInList ? "heart" : "heart-outline"} 
                  size={16} 
                  color={isInList ? "#ff4444" : "#FFFAE5"} 
                />
                <Text style={[styles.listButtonText, isInList && styles.listButtonTextActive]}>
                  {isInList ? i18n.t('removeFromList') : i18n.t('addToList')}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={async () => {
                const { data: { user } } = await supabase.auth.getUser();
                const profileId = user?.user_metadata?.selected_profile_id || user?.id;
                sharingService.shareContent(content.id, content.title, null, null, profileId);
              }}
            >
              <Ionicons name="share-outline" size={20} color="#FFFAE5" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {(content.type === 'series' || content.type === 'show') && (
          <View style={styles.seasonsContainer}>
            <Text style={styles.seasonsTitle}>Seasons</Text>
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.id}
                style={styles.seasonItem}
                onPress={() => router.push(`/season/${season.id}`)}
              >
                <Image 
                  source={{ 
                    uri: season.poster_url || 'https://via.placeholder.com/80x120/333/fff'
                  }} 
                  style={styles.seasonPoster}
                />
                <View style={styles.seasonInfo}>
                  <Text style={styles.seasonTitle}>Season {season.season_number}</Text>
                  <Text style={styles.seasonSubtitle}>{season.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    height: 300,
    resizeMode: 'cover',
  },
  contentInfo: {
    padding: 20,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  genre: {
    color: '#999',
    fontSize: 16,
    marginBottom: 16,
  },
  description: {
    color: '#FFFAE5',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  listButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
  },
  listButtonActive: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderColor: '#ff4444',
  },
  listButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
  },
  listButtonTextActive: {
    color: '#ff4444',
  },
  playButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
  },
  seasonsContainer: {
    marginTop: 20,
  },
  seasonsTitle: {
    color: '#FFFAE5',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  seasonPoster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    marginRight: 12,
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
});