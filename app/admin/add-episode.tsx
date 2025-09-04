import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { pickAndUploadImage } from '../../lib/image-upload';
import { Ionicons } from '@expo/vector-icons';

export default function AddEpisodeScreen() {
  const router = useRouter();
  const { seasonId } = useLocalSearchParams();
  const [seasonsList, setSeasonsList] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(seasonId || '');
  const [episodeNumber, setEpisodeNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  useEffect(() => {
    loadSeasons();
  }, []);

  const loadSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select(`
          id,
          season_number,
          title,
          content_id
        `)
        .order('season_number');

      if (data) {
        const seasonsWithContent = await Promise.all(
          data.map(async (season) => {
            const { data: content } = await supabase
              .from('content')
              .select('title')
              .eq('id', season.content_id)
              .single();
            return { ...season, content };
          })
        );
        setSeasonsList(seasonsWithContent);
      }

      if (error) throw error;
    } catch (error) {
      console.error('Error loading seasons:', error);
    }
  };

  const processVideoUrl = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
    
    return url;
  };

  const handleAddEpisode = async () => {
    if (!selectedSeason || !episodeNumber || !title || !videoUrl) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const processedVideoUrl = processVideoUrl(videoUrl);
      
      const { error } = await supabase
        .from('episodes')
        .insert({
          season_id: selectedSeason,
          episode_number: parseInt(episodeNumber),
          title,
          description,
          video_url: processedVideoUrl,
          thumbnail_url: thumbnailUrl,
          duration: duration ? parseInt(duration) : null
        });

      if (error) throw error;

      Alert.alert('Success', 'Episode added successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async () => {
    try {
      setUploadingThumbnail(true);
      const url = await pickAndUploadImage('episodes');
      if (url) {
        setThumbnailUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload episode thumbnail');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Add Episode</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Select Season *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
            {seasonsList.map((season) => (
              <TouchableOpacity
                key={season.id}
                style={[styles.seasonButton, selectedSeason === season.id && styles.seasonButtonActive]}
                onPress={() => setSelectedSeason(season.id)}
              >
                <Text style={styles.seasonButtonText}>
                  {season.content?.title} - S{season.season_number}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TextInput
            style={styles.input}
            placeholder="Episode Number *"
            placeholderTextColor="#666"
            value={episodeNumber}
            onChangeText={setEpisodeNumber}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Episode Title *"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Episode Video URL (YouTube or Google Drive) *"
            placeholderTextColor="#666"
            value={videoUrl}
            onChangeText={setVideoUrl}
          />
          
          <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Episode Thumbnail</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={handleThumbnailUpload}
              disabled={uploadingThumbnail}
            >
              <Ionicons name="image" size={20} color="#FFFAE5" />
              <Text style={styles.imageUploadText}>
                {uploadingThumbnail ? 'Uploading...' : 'Upload Thumbnail'}
              </Text>
            </TouchableOpacity>
            {thumbnailUrl && (
              <Image source={{ uri: thumbnailUrl }} style={styles.imagePreview} />
            )}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Duration (minutes)"
            placeholderTextColor="#666"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddEpisode}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add Episode'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 30,
  },
  form: {
    gap: 16,
  },
  label: {
    color: '#FFFAE5',
    fontSize: 16,
    marginBottom: 8,
  },
  seasonScroll: {
    marginBottom: 16,
  },
  seasonButton: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  seasonButtonActive: {
    backgroundColor: '#FFFAE5',
  },
  seasonButtonText: {
    color: '#FFFAE5',
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#FFFAE5',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageUploadContainer: {
    marginBottom: 16,
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
  },
  imageUploadText: {
    color: '#FFFAE5',
    fontSize: 14,
  },
  imagePreview: {
    width: 100,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
  },
});