import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalContent: 0,
    totalViews: 0,
    avgWatchTime: 0,
    topContent: [],
    genreStats: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get total registered users by counting distinct user_ids in profiles
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('user_id', { count: 'exact' })
        .eq('is_primary', true);
      
      const [content, views, topContent, genreViews] = await Promise.all([
        supabase.from('content').select('id'),
        supabase.from('content_views').select('view_duration, completed_view'),
        supabase.from('content_analytics').select('*, content(title, poster_url, genre)').order('total_views', { ascending: false }).limit(10),
        supabase.from('content_views').select('content(genre), view_duration').not('content.genre', 'is', null)
      ]);

      const totalViews = views.data?.length || 0;
      const totalWatchTime = views.data?.reduce((acc, view) => acc + (view.view_duration || 0), 0) || 0;
      const avgWatchTime = totalViews > 0 ? Math.round(totalWatchTime / totalViews / 60) : 0;

      // Calculate genre watch stats
      const genreWatchTime = {};
      genreViews.data?.forEach(item => {
        const genre = item.content?.genre;
        if (genre) {
          genreWatchTime[genre] = (genreWatchTime[genre] || 0) + (item.view_duration || 0);
        }
      });

      const genreStats = Object.entries(genreWatchTime)
        .map(([genre, totalTime]) => ({ 
          genre, 
          totalTime: Math.round(totalTime / 60), // in minutes
          count: genreViews.data?.filter(item => item.content?.genre === genre).length || 0
        }))
        .sort((a, b) => b.totalTime - a.totalTime);

      setAnalytics({
        totalUsers: userCount || 0,
        totalContent: content.data?.length || 0,
        totalViews,
        avgWatchTime,
        topContent: topContent.data || [],
        genreStats,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = '#FFFAE5' }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Analytics...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a1a']} style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Analytics Dashboard</Text>
        
        <View style={styles.statsGrid}>
          <StatCard title="Total Users" value={analytics.totalUsers} icon="people" color="#4CAF50" />
          <StatCard title="Total Content" value={analytics.totalContent} icon="film" color="#2196F3" />
          <StatCard title="Total Views" value={analytics.totalViews} icon="eye" color="#FF9800" />
          <StatCard title="Avg Watch Time" value={`${analytics.avgWatchTime}m`} icon="time" color="#9C27B0" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Content</Text>
          {analytics.topContent.map((item, index) => (
            <View key={item.id} style={styles.contentItem}>
              <Text style={styles.contentRank}>#{index + 1}</Text>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.content?.title}</Text>
                <Text style={styles.contentStats}>
                  {item.total_views} views • {Math.round(item.completion_rate * 100)}% completion
                </Text>
              </View>
              <Text style={styles.contentViews}>{item.total_views}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Most Watched Genres</Text>
          {analytics.genreStats.map((item) => (
            <View key={item.genre} style={styles.genreItem}>
              <Text style={styles.genreTitle}>{item.genre}</Text>
              <View style={styles.genreBar}>
                <View 
                  style={[
                    styles.genreBarFill, 
                    { width: `${(item.totalTime / Math.max(...analytics.genreStats.map(g => g.totalTime))) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.genreCount}>{item.totalTime}m</Text>
            </View>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFAE5',
    fontSize: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statTitle: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 250, 229, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  contentRank: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: 'bold',
    width: 30,
  },
  contentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contentTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '500',
  },
  contentStats: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  contentViews: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  genreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    width: 80,
  },
  genreBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 250, 229, 0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  genreBarFill: {
    height: '100%',
    backgroundColor: '#FFFAE5',
    borderRadius: 4,
  },
  genreCount: {
    color: '#FFFAE5',
    fontSize: 14,
    width: 30,
    textAlign: 'right',
  },
});