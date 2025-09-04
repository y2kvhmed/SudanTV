import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEnhancedStore } from '../../lib/enhanced-store';
import { supabase } from '../../lib/supabase';
import i18n from '../../locales';
import ContinueWatching from '../../components/ContinueWatching';
import Recommendations from '../../components/Recommendations';

const { width } = Dimensions.get('window');



export default function HomeScreen() {
  const router = useRouter();
  const { user, language } = useEnhancedStore();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const currentIndexRef = useRef(0);
  const isRTL = language === 'ar';

  useEffect(() => {
    if (!user) {
      router.replace('/');
      return;
    }
    loadContent();
  }, [user]);

  useEffect(() => {
    if (content.length > 0) {
      const interval = setInterval(changeHeroContent, 7000);
      return () => clearInterval(interval);
    }
  }, [content.length]);

  const changeHeroContent = () => {
    const heroContent = getFilteredHeroContent();
    if (heroContent.length <= 1) return;
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      const availableIndexes = heroContent
        .map((_, index) => index)
        .filter(index => index !== currentIndexRef.current);
      
      const newIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      
      currentIndexRef.current = newIndex;
      setCurrentHeroIndex(newIndex);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  const loadContent = async () => {
    try {
      let query = supabase
        .from('content')
        .select('*')
        .eq('status', 'published');
        

      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeroSection = () => {
    const heroContent = getFilteredHeroContent();
    if (heroContent.length === 0) return null;
    const heroItem = heroContent[currentHeroIndex % heroContent.length];
    if (!heroItem) return null;

    return (
      <View style={styles.heroContainer}>
        <Animated.View style={[styles.heroAnimated, { opacity: fadeAnim }]}>
          <Image 
            source={{ 
              uri: heroItem.backdrop_url || heroItem.poster_url || 'https://via.placeholder.com/400x300/333/fff?text=' + encodeURIComponent(heroItem.title)
            }} 
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>{heroItem.title}</Text>
              <Text style={styles.heroDescription}>
                {heroItem.description || 'No description available'}
              </Text>
              <View style={styles.heroButtons}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={() => router.push(`/content/${heroItem.id}`)}
                >
                  <Ionicons name="play" size={20} color="#000" />
                  <Text style={styles.playButtonText}>{i18n.t('playNow')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  const renderContentRow = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentRow}>
          {items.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.contentItem}
              onPress={() => router.push(`/content/${item.id}`)}
            >
              <Image 
                source={{ 
                  uri: item.poster_url || 'https://via.placeholder.com/120x180/333/fff?text=' + encodeURIComponent(item.title)
                }} 
                style={styles.contentImage}
              />
              <Text style={styles.contentTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.contentCategory}>
                {item.genre || item.type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Get hero content (already filtered at DB level for child profiles)
  const getFilteredHeroContent = () => {
    return content;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {renderHeroSection()}
      {user && (
        <>
          <ContinueWatching />
          <Recommendations />
        </>
      )}
      {renderContentRow(i18n.t('trending'), content.filter(item => item.is_trending))}
      {renderContentRow(i18n.t('newReleases'), content.filter(item => item.is_new_release))}
      {renderContentRow(i18n.t('movies'), content.filter(item => item.type === 'movie'))}
      {renderContentRow(i18n.t('series'), content.filter(item => item.type === 'series'))}
      {renderContentRow(i18n.t('shows'), content.filter(item => item.type === 'show'))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    height: 500,
    position: 'relative',
  },
  heroAnimated: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroTitle: {
    color: '#FFFAE5',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroDescription: {
    color: '#FFFAE5',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAE5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  playButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
  },
  contentSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFAE5',
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 13,
    textAlign: 'left',
  },
  contentRow: {
    paddingLeft: 20,
    paddingBottom: 15,
  },
  contentItem: {
    marginRight: 12,
    width: 120,
  },
  contentImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  contentTitle: {
    color: '#FFFAE5',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  contentCategory: {
    color: '#999',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});