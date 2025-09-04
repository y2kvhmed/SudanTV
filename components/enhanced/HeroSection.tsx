import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
import AnimatedPressable from '../ui/AnimatedPressable';
import Card from '../ui/Card';
import { Content } from '../../types';
import { useEnhancedStore } from '../../lib/enhanced-store';
import i18n from '../../locales';

const { width, height } = Dimensions.get('window');

interface HeroSectionProps {
  content: Content[];
}

export default function HeroSection({ content }: HeroSectionProps) {
  const router = useRouter();
  const { language } = useEnhancedStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredContent, setFeaturedContent] = useState<Content | null>(null);
  
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);

  const isRTL = language === 'ar';

  useEffect(() => {
    if (content.length > 0) {
      const featured = content.find(item => item.is_featured) || content[0];
      setFeaturedContent(featured);
    }
  }, [content]);

  useEffect(() => {
    // Auto-rotate hero content every 8 seconds
    const interval = setInterval(() => {
      if (content.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % content.length);
        fadeAnim.value = withSequence(
          withTiming(0, { duration: 300 }),
          withTiming(1, { duration: 300 })
        );
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [content.length]);

  useEffect(() => {
    if (content[currentIndex]) {
      setFeaturedContent(content[currentIndex]);
    }
  }, [currentIndex, content]);

  useEffect(() => {
    // Glow animation for play button
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + (glowAnim.value * 0.4),
  }));

  if (!featuredContent) return null;

  const handlePlay = () => {
    router.push(`/player/${featuredContent.id}`);
  };

  const handleMoreInfo = () => {
    router.push(`/content/${featuredContent.id}`);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Image
        source={{ uri: featuredContent.backdrop_url || featuredContent.poster_url }}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={500}
      />
      
      <LinearGradient
        colors={[
          'transparent',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.7)',
          '#000000'
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      />

      <View style={[styles.content, isRTL && styles.rtlContent]}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, isRTL && styles.rtlText]}>
            SudanTV
          </Text>
          <Text style={[styles.tagline, isRTL && styles.rtlText]}>
            Original
          </Text>
        </View>

        <Card variant="glass" style={styles.infoCard}>
          <View style={styles.cardContent}>
            <Text style={[styles.title, isRTL && styles.rtlText]} numberOfLines={2}>
              {featuredContent.title}
            </Text>
            
            <View style={[styles.metadata, isRTL && styles.rtlMetadata]}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{featuredContent.rating.toFixed(1)}</Text>
              </View>
              <Text style={styles.year}>{featuredContent.year}</Text>
              {featuredContent.duration_minutes && (
                <Text style={styles.duration}>{featuredContent.duration_minutes}m</Text>
              )}
              <View style={styles.genreBadge}>
                <Text style={styles.genreText}>
                  {featuredContent.genre?.[0] || 'Drama'}
                </Text>
              </View>
            </View>

            <Text style={[styles.description, isRTL && styles.rtlText]} numberOfLines={3}>
              {featuredContent.description}
            </Text>

            <View style={[styles.buttonContainer, isRTL && styles.rtlButtons]}>
              <Animated.View style={glowStyle}>
                <AnimatedPressable style={styles.playButton} onPress={handlePlay}>
                  <Ionicons name="play" size={24} color="#000000" />
                  <Text style={styles.playButtonText}>{i18n.t('playNow')}</Text>
                </AnimatedPressable>
              </Animated.View>

              <AnimatedPressable style={styles.infoButton} onPress={handleMoreInfo}>
                <Ionicons name="information-circle-outline" size={24} color="#FFFAE5" />
                <Text style={styles.infoButtonText}>{i18n.t('moreInfo')}</Text>
              </AnimatedPressable>
            </View>
          </View>
        </Card>

        {/* Content indicators */}
        {content.length > 1 && (
          <View style={[styles.indicators, isRTL && styles.rtlIndicators]}>
            {content.slice(0, 5).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.7,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  rtlContent: {
    alignItems: 'flex-end',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFAE5',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#FFFAE5',
    opacity: 0.8,
    marginTop: 4,
  },
  rtlText: {
    textAlign: 'right',
  },
  infoCard: {
    maxWidth: width * 0.9,
    marginBottom: 20,
  },
  cardContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFAE5',
    marginBottom: 12,
    lineHeight: 34,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rtlMetadata: {
    flexDirection: 'row-reverse',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: '#FFFAE5',
    fontSize: 14,
    fontWeight: '600',
  },
  year: {
    color: '#999',
    fontSize: 14,
  },
  duration: {
    color: '#999',
    fontSize: 14,
  },
  genreBadge: {
    backgroundColor: 'rgba(255, 250, 229, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    color: '#FFFAE5',
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    color: '#FFFAE5',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  rtlButtons: {
    flexDirection: 'row-reverse',
  },
  playButton: {
    backgroundColor: '#FFFAE5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#FFFAE5',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  playButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  infoButton: {
    backgroundColor: 'rgba(255, 250, 229, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 250, 229, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  infoButtonText: {
    color: '#FFFAE5',
    fontSize: 16,
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'center',
  },
  rtlIndicators: {
    flexDirection: 'row-reverse',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 250, 229, 0.3)',
  },
  activeIndicator: {
    backgroundColor: '#FFFAE5',
    width: 24,
  },
});