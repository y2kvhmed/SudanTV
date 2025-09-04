import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function MyListScreen() {
  const router = useRouter();
  const [myList, setMyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_lists')
        .select('*, content(*)')
        .eq('user_id', user.id);
        
      if (error) throw error;
      setMyList(data || []);
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFAE5" />
        </TouchableOpacity>
        <Text style={styles.title}>My List</Text>
      </View>

      <ScrollView style={styles.content}>
        {myList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#666" />
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptyText}>Add movies and shows you want to watch</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {myList.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={() => router.push(`/content/${item.content.id}`)}
              >
                <Image 
                  source={{ uri: item.content.poster_url }} 
                  style={styles.poster}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.contentTitle} numberOfLines={2}>
                    {item.content.title}
                  </Text>
                  <Text style={styles.genre}>{item.content.genre}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFAE5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    color: '#FFFAE5',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  item: {
    width: '48%',
    marginBottom: 20,
  },
  poster: {
    width: '100%',
    height: 240,
    borderRadius: 8,
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
  genre: {
    color: '#999',
    fontSize: 12,
  },
});