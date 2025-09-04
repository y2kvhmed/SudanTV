import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { watchProgressService } from '../lib/watch-progress';
import { supabase } from '../lib/supabase';

export default function Recommendations() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);



  const loadRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const profileId = user?.user_metadata?.selected_profile_id;
      
      if (profileId) {
        const data = await watchProgressService.getRecommendations(profileId);
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (item) => {
    router.push(`/content/${item.id}`);
  };

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended for You</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => handlePress(item)}
          >
            <Image 
              source={{ uri: item.poster_url }} 
              style={styles.poster}
              resizeMode="cover"
            />
            <View style={styles.info}>
              <Text style={styles.contentTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.genre}>{item.genre}</Text>
              {item.content_analytics?.[0] && (
                <Text style={styles.views}>
                  {item.content_analytics[0].total_views} views
                </Text>
              )}
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
    width: 140,
    marginRight: 16,
  },
  poster: {
    width: 140,
    height: 210,
    borderRadius: 8,
  },
  info: {
    marginTop: 8,
  },
  contentTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  genre: {
    color: '#999',
    fontSize: 12,
    marginBottom: 2,
  },
  views: {
    color: '#666',
    fontSize: 11,
  },
});