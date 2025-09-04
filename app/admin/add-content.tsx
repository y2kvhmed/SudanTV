import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { pickAndUploadImage } from '../../lib/image-upload';
import { notifyNewContent } from '../../lib/notification-sender';
import { Ionicons } from '@expo/vector-icons';

export default function AddContentScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('movie');
  const [genre, setGenre] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewRelease, setIsNewRelease] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  const handleAddContent = async () => {
    if (!title || !description || !genre) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (type === 'movie' && !videoUrl) {
      Alert.alert('Error', 'Video URL is required for movies');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content')
        .insert({
          title,
          description,
          type,
          genre,
          poster_url: posterUrl,
          backdrop_url: backdropUrl,
          video_url: videoUrl,
          is_featured: isFeatured,
          is_trending: isTrending,
          is_new_release: isNewRelease,
          status: 'published'
        })
        .select()
        .single();

      if (error) throw error;

      // Send push notifications to all users
      await notifyNewContent(title, type, data.id);

      Alert.alert('Success', 'Content added successfully and notifications sent!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePosterUpload = async () => {
    try {
      setUploadingPoster(true);
      const url = await pickAndUploadImage('posters');
      if (url) {
        setPosterUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload poster image');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBackdropUpload = async () => {
    try {
      setUploadingBackdrop(true);
      const url = await pickAndUploadImage('backdrops');
      if (url) {
        setBackdropUrl(url);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload backdrop image');
    } finally {
      setUploadingBackdrop(false);
    }
  };

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Add Content</Text>
        
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description *"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Type *</Text>
            <View style={styles.picker}>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'movie' && styles.typeButtonActive]}
                onPress={() => setType('movie')}
              >
                <Text style={styles.typeButtonText}>Movie</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'series' && styles.typeButtonActive]}
                onPress={() => setType('series')}
              >
                <Text style={styles.typeButtonText}>Series</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, type === 'show' && styles.typeButtonActive]}
                onPress={() => setType('show')}
              >
                <Text style={styles.typeButtonText}>Show</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Genre *"
            placeholderTextColor="#666"
            value={genre}
            onChangeText={setGenre}
          />
          
          <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Poster Image</Text>
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
          
          <View style={styles.imageUploadContainer}>
            <Text style={styles.label}>Backdrop Image</Text>
            <TouchableOpacity 
              style={styles.imageUploadButton}
              onPress={handleBackdropUpload}
              disabled={uploadingBackdrop}
            >
              <Ionicons name="image" size={20} color="#FFFAE5" />
              <Text style={styles.imageUploadText}>
                {uploadingBackdrop ? 'Uploading...' : 'Upload Backdrop'}
              </Text>
            </TouchableOpacity>
            {backdropUrl && (
              <Image source={{ uri: backdropUrl }} style={styles.imagePreview} />
            )}
          </View>
          
          {type === 'movie' && (
            <TextInput
              style={styles.input}
              placeholder="Video URL *"
              placeholderTextColor="#666"
              value={videoUrl}
              onChangeText={setVideoUrl}
            />
          )}
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, isFeatured && styles.checkboxActive]}
              onPress={() => setIsFeatured(!isFeatured)}
            >
              <Text style={styles.checkboxText}>Featured</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.checkbox, isTrending && styles.checkboxActive]}
              onPress={() => setIsTrending(!isTrending)}
            >
              <Text style={styles.checkboxText}>Trending</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.checkbox, isNewRelease && styles.checkboxActive]}
              onPress={() => setIsNewRelease(!isNewRelease)}
            >
              <Text style={styles.checkboxText}>New Release</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddContent}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add Content'}
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
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkbox: {
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkboxActive: {
    backgroundColor: '#FFFAE5',
  },
  checkboxText: {
    color: '#FFFAE5',
    fontSize: 14,
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
  pickerContainer: {
    marginBottom: 8,
  },
  label: {
    color: '#FFFAE5',
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#FFFAE5',
  },
  typeButtonText: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
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