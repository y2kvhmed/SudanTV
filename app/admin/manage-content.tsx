import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function ManageContentScreen() {
  const router = useRouter();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('content')
                .delete()
                .eq('id', id);

              if (error) throw error;
              loadContent();
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
        <Text style={styles.title}>Manage Content</Text>
      </View>
      
      <View style={styles.contentList}>
        {content.map((item) => (
          <View key={item.id} style={styles.contentItem}>
            <Image 
              source={{ uri: item.poster_url || 'https://via.placeholder.com/80x120/333/fff' }} 
              style={styles.poster}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemType}>{item.type}</Text>
              <Text style={styles.itemGenre}>{item.genre}</Text>
            </View>
            <View style={styles.actionButtons}>
              {(item.type === 'series' || item.type === 'show') && (
                <TouchableOpacity 
                  style={styles.seasonButton}
                  onPress={() => router.push(`/admin/manage-seasons?contentId=${item.id}`)}
                >
                  <Ionicons name="albums" size={16} color="#FFFAE5" />
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 28,
    fontWeight: 'bold',
  },
  contentList: {
    paddingHorizontal: 20,
  },
  contentItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemType: {
    color: '#999',
    fontSize: 14,
    marginBottom: 2,
  },
  itemGenre: {
    color: '#666',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  seasonButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderRadius: 4,
  },
  deleteButton: {
    padding: 8,
  },
});