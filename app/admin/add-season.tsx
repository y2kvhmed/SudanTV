import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { pickAndUploadImage } from '../../lib/image-upload';
import { Ionicons } from '@expo/vector-icons';

export default function AddSeasonScreen() {
  const router = useRouter();
  const { contentId } = useLocalSearchParams();
  const [seriesList, setSeriesList] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(contentId || '');
  const [seasonNumber, setSeasonNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title')
        .in('type', ['series', 'show'])
        .order('title');

      if (error) throw error;
      setSeriesList(data || []);
    } catch (error) {
      console.error('Error loading series:', error);
    }
  };

  const handleAddSeason = async () => {
    if (!selectedSeries || !seasonNumber || !title) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('seasons')
        .insert({
          content_id: selectedSeries,
          season_number: parseInt(seasonNumber),
          title,
          description,
          poster_url: posterUrl
        });

      if (error) throw error;

      Alert.alert('Success', 'Season added successfully');
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterUpload = async () => {
    try {
      setUploadingPoster(true);
      const url = await pickAndUploadImage('seasons');
      if (url) {
        setPosterUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload season poster');
    } finally {
      setUploadingPoster(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Add Season</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Select Series/Show *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seriesScroll}>
            {seriesList.map((series) => (
              <TouchableOpacity
                key={series.id}
                style={[styles.seriesButton, selectedSeries === series.id && styles.seriesButtonActive]}
                onPress={() => setSelectedSeries(series.id)}
              >
                <Text style={styles.seriesButtonText}>{series.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TextInput
            style={styles.input}
            placeholder="Season Number *"
            placeholderTextColor="#666"
            value={seasonNumber}
            onChangeText={setSeasonNumber}
            keyboardType="numeric"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Season Title *"
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
          
          <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Season Poster</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={handlePosterUpload}
              disabled={uploadingPoster}
            >
              <Ionicons name="image" size={20} color="#FFFAE5" />
              <Text style={styles.imageUploadText}>
                {uploadingPoster ? 'Uploading...' : 'Upload Poster'}
              </Text>
            </TouchableOpacity>
            {posterUrl && (
              <Image source={{ uri: posterUrl }} style={styles.imagePreview} />
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddSeason}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add Season'}
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
  seriesScroll: {
    marginBottom: 16,
  },
  seriesButton: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  seriesButtonActive: {
    backgroundColor: '#FFFAE5',
  },
  seriesButtonText: {
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
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
});