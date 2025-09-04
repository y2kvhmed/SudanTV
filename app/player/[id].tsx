import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import * as ScreenOrientation from 'expo-screen-orientation';
import { watchProgressService } from '../../lib/watch-progress';
import VideoPlayer from '../../components/VideoPlayer';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
  const { id, type } = useLocalSearchParams();
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const progressInterval = useRef(null);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    loadVideo();
    if (Platform.OS !== 'web') {
      ScreenOrientation.unlockAsync();
    }
    
    // Start progress tracking
    progressInterval.current = setInterval(() => {
      updateWatchProgress();
    }, 10000); // Update every 10 seconds
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [id]);

  const updateWatchProgress = async () => {
    if (currentProgress > 0 && videoDuration > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const profileId = user?.user_metadata?.selected_profile_id || user?.id;
        
        if (profileId) {
          const contentId = type === 'episode' ? (await getContentIdFromEpisode(id as string)) : id as string;
          
          // Save progress
          await watchProgressService.saveProgress(
            profileId,
            contentId,
            currentProgress,
            videoDuration,
            type === 'episode' ? id as string : undefined
          );
          
          // Track view for analytics
          await supabase.from('content_views').insert({
            profile_id: profileId,
            content_id: contentId,
            episode_id: type === 'episode' ? id as string : null,
            view_duration: currentProgress,
            completed_view: currentProgress >= videoDuration * 0.9
          });
        }
      } catch (error) {
        console.error('Error updating watch progress:', error);
      }
    }
  };

  const getContentIdFromEpisode = async (episodeId: string) => {
    const { data } = await supabase
      .from('episodes')
      .select('content_id')
      .eq('id', episodeId)
      .single();
    return data?.content_id;
  };

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (type === 'movie') {
        const { data, error } = await supabase
          .from('content')
          .select('video_url')
          .eq('id', id)
          .single();

        if (error) throw error;
        const processedUrl = processVideoUrl(data.video_url);
        setVideoUrl(processedUrl);
      } else {
        const { data, error } = await supabase
          .from('episodes')
          .select('video_url')
          .eq('id', id)
          .single();

        if (error) throw error;
        console.log('Episode video URL:', data.video_url);
        const processedUrl = processVideoUrl(data.video_url);
        setVideoUrl(processedUrl);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const processVideoUrl = (url) => {
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview?embedded=true`;
      }
    }
    return url;
  };











  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!videoUrl) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No video URL found</Text>
        <Text style={styles.errorText}>URL: {videoUrl}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoPlayer 
        videoUrl={videoUrl}
        onProgress={(progress, duration) => {
          setCurrentProgress(progress);
          setVideoDuration(duration);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
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
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    paddingHorizontal: 20,
  },

});