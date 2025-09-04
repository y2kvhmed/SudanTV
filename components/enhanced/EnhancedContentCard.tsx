import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import AnimatedPressable from '../ui/AnimatedPressable';
import Card from '../ui/Card';
import { Content } from '../../types';

const { width } = Dimensions.get('window');

interface EnhancedContentCardProps {
  content: Content;
  width?: number;
  height?: number;
  showInfo?: boolean;
  variant?: 'poster' | 'landscape' | 'hero';
}

export default function EnhancedContentCard({ 
  content, 
  width: cardWidth = 160, 
  height: cardHeight = 240,
  showInfo = true,
  variant = 'poster'
}: EnhancedContentCardProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePress = () => {
    router.push(`/content/${content.id}`);
  };

  const handlePressIn = () => {
    scale.value = withSpring(1.05, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0, { duration: 200 });
  };

  return (
    <AnimatedPressable
      style={[styles.container, { width: cardWidth, height: cardHeight }, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Card variant="glass" style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: content.poster_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            onLoad={() => setImageLoaded(true)}
          />
          
          {content.is_premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}

          {content.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={10} color="#FFD700" />
              <Text style={styles.ratingText}>{content.rating.toFixed(1)}</Text>
            </View>
          )}

          <Animated.View style={[styles.overlay, overlayStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />
            <View style={styles.overlayContent}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color="#000000" />
              </View>
              <Text style={styles.overlayTitle} numberOfLines={2}>
                {content.title}
              </Text>
              <Text style={styles.overlayYear}>{content.year}</Text>
            </View>
          </Animated.View>
        </View>

        {showInfo && (
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {content.title}
            </Text>
            <View style={styles.metadata}>
              <Text style={styles.year}>{content.year}</Text>
              {content.duration_minutes && (
                <Text style={styles.duration}>{content.duration_minutes}m</Text>
              )}
            </View>
          </View>
        )}
      </Card>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '600',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 3,
  },
  ratingText: {
    color: '#FFFAE5',
    fontSize: 10,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  gradient: {
    flex: 1,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  overlayTitle: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  overlayYear: {
    color: '#999',
    fontSize: 12,
  },
  info: {
    padding: 12,
  },
  title: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
  },
  year: {
    color: '#999',
    fontSize: 12,
  },
  duration: {
    color: '#999',
    fontSize: 12,
  },
});