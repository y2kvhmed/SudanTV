import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Content } from '../types';

interface ContentCardProps {
  content: Content;
  width?: number;
  height?: number;
}

export default function ContentCard({ content, width = 150, height = 220 }: ContentCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/content/${content.id}`);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width, height }]} 
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: content.poster_url }} 
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
      </View>
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {content.title}
        </Text>
        <Text style={styles.year}>{content.year}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  info: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  year: {
    color: '#999',
    fontSize: 12,
  },
});